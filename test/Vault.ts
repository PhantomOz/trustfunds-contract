import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Vault", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(unlockTime, otherAccount, owner, { value: lockedAmount });

    return { vault, unlockTime, lockedAmount, owner, otherAccount, thirdAccount };
  }

  describe("Deployment", function () {
    it("Should receive and store the funds to lock", async function () {
      const { vault, lockedAmount } = await loadFixture(
        deployOneYearLockFixture
      );
      expect(await ethers.provider.getBalance(vault.target)).to.equal(
        lockedAmount
      );
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      const [owner, otherAccount] = await ethers.getSigners();
      const latestTime = await time.latest();
      const Vault = await ethers.getContractFactory("Vault");
      await expect(Vault.deploy(latestTime, otherAccount, owner, { value: 1 })).to.be.revertedWithCustomError(Vault, "MUST_UNLOCK_IN_THE_FUTURE");
    });

    it("Should fail if the beneficiary is a zeroAddress", async function () {
      const [owner, otherAccount] = await ethers.getSigners();
      const ZeroAddress = await ethers.ZeroAddress;
      const latestTime = await time.latest() + 300;
      const Vault = await ethers.getContractFactory("Vault");
      await expect(Vault.deploy(latestTime, ZeroAddress, owner, { value: 1 })).to.be.revertedWithCustomError(Vault, "ADDRESS_CANT_BE_ZERO");
    });

    it("Should fail if the creator is a zeroAddress", async function () {
      const [owner] = await ethers.getSigners();
      const ZeroAddress = await ethers.ZeroAddress;
      const latestTime = await time.latest() + 300;
      const Vault = await ethers.getContractFactory("Vault");
      await expect(Vault.deploy(latestTime, owner, ZeroAddress, { value: 1 })).to.be.revertedWithCustomError(Vault, "ADDRESS_CANT_BE_ZERO");
    });

    it("Should fail if amount is 0", async function () {
      const [owner, otherAccount] = await ethers.getSigners();
      const latestTime = await time.latest() + 300;
      const Vault = await ethers.getContractFactory("Vault");
      await expect(Vault.deploy(latestTime, otherAccount, owner, { value: 0 })).to.be.revertedWithCustomError(Vault, "AMOUNT_CANT_BE_ZERO");
    });

    it("Should receive and store the funds to lock", async function () {
      const { vault, lockedAmount, unlockTime, owner, otherAccount } = await loadFixture(
        deployOneYearLockFixture
      );
      const [la, ut, oa, ow] = await vault.getDetails();
      expect(la).to.equals(lockedAmount);
      expect(ut).to.equals(unlockTime);
      expect(oa).to.equals(otherAccount);
      expect(ow).to.equals(owner);
    });
  });
  
  describe("Add to balance", function () {
    it("Should receive and addFunds", async function () {
      const { vault, lockedAmount } = await loadFixture(
        deployOneYearLockFixture
      );
      await vault.addToBalance({value: lockedAmount});
      expect(await ethers.provider.getBalance(vault.target)).to.equal(
        lockedAmount+lockedAmount
      );
    });
     it("Should fail if value is 0", async function () {
      const { vault} = await loadFixture(
        deployOneYearLockFixture
      );
      await expect(vault.addToBalance({value: 0})).to.be.revertedWithCustomError(vault, "AMOUNT_CANT_BE_ZERO");
    });
    it("Should fail if unlock time has already being reached", async function () {
      const { vault, unlockTime} = await loadFixture(
        deployOneYearLockFixture
      );
      await time.increaseTo(unlockTime);
      await expect(vault.addToBalance({value: 1})).to.be.revertedWithCustomError(vault, "VAULT_ALREADY_UNLOCK");
    });
  });

  describe("Withdraw", function () {
    it("Should fail if unlock time has not reached", async function () {
      const { vault } = await loadFixture(
        deployOneYearLockFixture
      );
      await expect(vault.withdraw()).to.be.revertedWithCustomError(vault, "VAULT_STILL_LOCK");
    });
    it("Should fail if it is not the creator of beneficiary that called it", async function () {
      const { vault, thirdAccount, unlockTime } = await loadFixture(
        deployOneYearLockFixture
      );
      await time.increaseTo(unlockTime);
      await expect(vault.connect(thirdAccount).withdraw()).to.be.revertedWithCustomError(vault, "NOT_A_BENEFACTOR");
    });
    it("Should Emit the withdrawal event", async function () {
      const { vault, unlockTime, otherAccount, lockedAmount} = await loadFixture(
        deployOneYearLockFixture
      );
      await time.increaseTo(unlockTime);
      await expect(vault.connect(otherAccount).withdraw()).to.emit(vault, "Withdrawal").withArgs(vault.target, otherAccount, lockedAmount);
    });
  });
});

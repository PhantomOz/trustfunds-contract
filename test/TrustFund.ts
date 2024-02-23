import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TrustFund", function () {
    async function deployTrustFund() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;
    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const TrustFund = await ethers.getContractFactory("TrustFund");
    const trustFund = await TrustFund.deploy();

    return { trustFund, unlockTime, lockedAmount, owner, otherAccount, thirdAccount };
  }

  describe("createVault", function() {
    it("Should create vaults", async function () {
        const {trustFund, unlockTime, lockedAmount, otherAccount, owner} = await loadFixture(deployTrustFund);
        await expect(await trustFund.createVault(otherAccount, unlockTime, {value: lockedAmount})).to.emit(trustFund, "CreateVault").withArgs(owner, otherAccount, anyValue);
    })
  })
  describe("addToVault", function() {
    it("Should fail when we add to vault", async function () {
        const {trustFund, unlockTime, lockedAmount, otherAccount, owner} = await loadFixture(deployTrustFund);
        await trustFund.createVault(otherAccount, unlockTime, {value: lockedAmount});
        await expect(trustFund.addToVault(1)).to.be.revertedWithCustomError(trustFund, "NO_VAULT");
    });
    it("Should add to vault", async function () {
        const {trustFund, unlockTime, lockedAmount, otherAccount, owner} = await loadFixture(deployTrustFund);
        await trustFund.createVault(otherAccount, unlockTime, {value: lockedAmount});
        await expect(trustFund.addToVault(0, {value: lockedAmount})).to.emit(trustFund, "Deposit").withArgs(owner, anyValue, lockedAmount);
    });
  });
  describe("Withdraw", function() {
    it("Should fail when we withdraw", async function () {
        const {trustFund, unlockTime, lockedAmount, otherAccount, owner} = await loadFixture(deployTrustFund);
        await trustFund.createVault(otherAccount, unlockTime, {value: lockedAmount});
        await expect(trustFund.withdrawFromVault(1)).to.be.revertedWithCustomError(trustFund, "NO_VAULT");
    });
    it("Should withdraw from vault", async function () {
        const {trustFund, unlockTime, lockedAmount, otherAccount, owner} = await loadFixture(deployTrustFund);
        await trustFund.createVault(otherAccount, unlockTime, {value: lockedAmount});
        await time.increaseTo(unlockTime);
        await expect(trustFund.withdrawFromVault(0)).to.changeEtherBalance(owner, +lockedAmount);
    });
  })
});
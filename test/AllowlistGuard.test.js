const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AllowlistGuard with Safe", function () {
  let safe, guard;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    const AllowlistGuard = await ethers.getContractFactory("AllowlistGuard");
    guard = await AllowlistGuard.deploy(owner.address, [addr1.address]);
    await guard.waitForDeployment();
    
    const MockSafe = await ethers.getContractFactory("MockSafe");
    safe = await MockSafe.deploy([owner.address], 1);
    await safe.waitForDeployment();
    
    await owner.sendTransaction({
      to: await safe.getAddress(),
      value: ethers.parseEther("10"),
    });
    
    await safe.setGuard(await guard.getAddress());
  });

  describe("Guard Deployment", function () {
    it("Should deploy with correct owner", async function () {
      expect(await guard.owner()).to.equal(owner.address);
    });

    it("Should have initial allowlisted address", async function () {
      expect(await guard.isAllowlisted(addr1.address)).to.be.true;
    });
  });

  describe("Guard Management", function () {
    it("Should allow owner to add address", async function () {
      await guard.addToAllowlist(addr2.address);
      expect(await guard.isAllowlisted(addr2.address)).to.be.true;
    });

    it("Should allow owner to remove address", async function () {
      await guard.removeFromAllowlist(addr1.address);
      expect(await guard.isAllowlisted(addr1.address)).to.be.false;
    });

    it("Should revert if non-owner tries to add", async function () {
      await expect(
        guard.connect(addr1).addToAllowlist(addr2.address)
      ).to.be.revertedWithCustomError(guard, "NotOwner");
    });

    it("Should batch add addresses", async function () {
      await guard.batchAddToAllowlist([addr2.address, addr3.address]);
      expect(await guard.isAllowlisted(addr2.address)).to.be.true;
      expect(await guard.isAllowlisted(addr3.address)).to.be.true;
    });
  });

  describe("Transaction Validation", function () {
    it("Should allow transaction to allowlisted address", async function () {
      await expect(
        safe.execTransaction(
          addr1.address, ethers.parseEther("1"), "0x", 0, 0, 0, 0,
          ethers.ZeroAddress, ethers.ZeroAddress, "0x"
        )
      ).to.emit(guard, "TransactionChecked");
    });

    it("Should reject transaction to non-allowlisted address", async function () {
      await expect(
        safe.execTransaction(
          addr2.address, ethers.parseEther("1"), "0x", 0, 0, 0, 0,
          ethers.ZeroAddress, ethers.ZeroAddress, "0x"
        )
      ).to.be.revertedWithCustomError(guard, "AddressNotAllowlisted");
    });

    it("Should work after adding new address", async function () {
      await guard.addToAllowlist(addr2.address);
      await safe.execTransaction(
        addr2.address, ethers.parseEther("0.5"), "0x", 0, 0, 0, 0,
        ethers.ZeroAddress, ethers.ZeroAddress, "0x"
      );
      expect(await safe.nonce()).to.equal(1);
    });
  });

  describe("ERC165 Support", function () {
    it("Should support ERC165", async function () {
      expect(await guard.supportsInterface("0x01ffc9a7")).to.be.true;
    });

    it("Should support Guard interface", async function () {
      expect(await guard.supportsInterface("0xe6d7a83a")).to.be.true;
    });
  });
});

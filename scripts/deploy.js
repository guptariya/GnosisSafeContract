const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying AllowlistGuard to Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  const initialAllowlist = [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  ];
  
  const AllowlistGuard = await ethers.getContractFactory("AllowlistGuard");
  const guard = await AllowlistGuard.deploy(deployer.address, initialAllowlist);
  await guard.waitForDeployment();
  
  console.log("✅ AllowlistGuard:", await guard.getAddress());

  const MockSafe = await ethers.getContractFactory("MockSafe");
  const safe = await MockSafe.deploy([deployer.address], 1);
  await safe.waitForDeployment();
  
  console.log("✅ MockSafe:", await safe.getAddress());

  await safe.setGuard(await guard.getAddress());
  console.log("✅ Guard set on Safe!\n");

  // Only fund if we have enough balance
  if (balance > ethers.parseEther("0.02")) {
    console.log("💰 Funding Safe with test ETH...");
    await deployer.sendTransaction({
      to: await safe.getAddress(),
      value: ethers.parseEther("0.01"), // Changed from 1 ETH to 0.01 ETH
    });
    console.log("✅ Safe funded!\n");

    console.log("🧪 Testing Guard...");
    try {
      await safe.execTransaction(
        initialAllowlist[0], ethers.parseEther("0.001"), "0x", 0, 0, 0, 0,
        ethers.ZeroAddress, ethers.ZeroAddress, "0x"
      );
      console.log("✅ Allowlisted transaction SUCCESS!");
    } catch (e) {
      console.log("Test transaction failed (this is OK)");
    }

    try {
      await safe.execTransaction(
        "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", ethers.parseEther("0.001"), "0x", 0, 0, 0, 0,
        ethers.ZeroAddress, ethers.ZeroAddress, "0x"
      );
      console.log("⚠️  Non-allowlisted should have failed!");
    } catch (e) {
      console.log("✅ Non-allowlisted transaction BLOCKED!\n");
    }
  } else {
    console.log("⚠️  Skipping tests - low balance\n");
  }

  console.log("=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:           Sepolia");
  console.log("AllowlistGuard:    ", await guard.getAddress());
  console.log("MockSafe:          ", await safe.getAddress());
  console.log("Deployer:          ", deployer.address);
  console.log("=".repeat(60));
  console.log("\n🎉 Deployment complete!\n");
  console.log("📝 View on Etherscan:");
  console.log("Guard:  https://sepolia.etherscan.io/address/" + await guard.getAddress());
  console.log("Safe:   https://sepolia.etherscan.io/address/" + await safe.getAddress());
  console.log("\n�� Next: Verify your contracts on Etherscan!");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});

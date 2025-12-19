import { network } from "hardhat";
const { ethers } = await network.connect();

async function main() {
  const didAddress = "0x5dF667D77397440F146F7f20f9fDc2151f947AbF";

  const License = await ethers.getContractFactory("LicenseManager");
  const license = await License.deploy(didAddress);
  await license.waitForDeployment();

  console.log("LicenseManager deployed to:", await license.getAddress());
}

main().catch(console.error);

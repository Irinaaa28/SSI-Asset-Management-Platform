import { network } from "hardhat";
const { ethers } = await network.connect();

async function main() {
  const DID = await ethers.getContractFactory("DIDRegistry");
  const did = await DID.deploy();
  await did.waitForDeployment();

  console.log("DIDRegistry deployed to:", await did.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

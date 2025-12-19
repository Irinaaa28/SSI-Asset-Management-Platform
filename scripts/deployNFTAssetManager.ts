import { network } from "hardhat";
const { ethers } = await network.connect();

async function main() {
  const didAddress = "0x5dF667D77397440F146F7f20f9fDc2151f947AbF";

  const NFT = await ethers.getContractFactory("NFTAssetManager");
  const nft = await NFT.deploy(didAddress);
  await nft.waitForDeployment();

  console.log("NFTAssetManager deployed to:", await nft.getAddress());
}

main().catch(console.error);

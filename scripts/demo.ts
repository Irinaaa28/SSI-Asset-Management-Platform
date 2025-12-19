import { network } from "hardhat";
const { ethers } = await network.connect();

async function main() {
  const DID_REGISTRY_ADDRESS = "0x5dF667D77397440F146F7f20f9fDc2151f947AbF";
  const NFT_ASSET_MANAGER_ADDRESS = "0xf7Be70f570A51A67866D688d500b0530802b4c9c";

  const [user] = await ethers.getSigners();
  console.log("Using account:", user.address);

  const didRegistry = await ethers.getContractAt(
    "DIDRegistry",
    DID_REGISTRY_ADDRESS
  );

  const txDid = await didRegistry.registerDID("ipfs://user-did-metadata");
  await txDid.wait();

  const hasDid = await didRegistry.hasDID(user.address);
  console.log("User has DID:", hasDid);

  const nft = await ethers.getContractAt(
    "NFTAssetManager",
    NFT_ASSET_MANAGER_ADDRESS
  );

  const mintFee = await nft.calculateFee(await nft.MINT_FEE());

  const txMint = await nft.mintNFT(
    "ipfs://nft-metadata-cid",
    { value: mintFee }
  );
  const receipt = await txMint.wait();
  console.log("Transaction hash:", receipt?.hash);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});
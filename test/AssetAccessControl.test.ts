import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("AssetAccessControl (Diamond Inheritance)", function () {

  async function deployFixture() {
    const [owner, alice, bob, charlie] = await ethers.getSigners();

    const DID = await ethers.getContractFactory("DIDRegistry");
    const did = await DID.deploy();
    await did.waitForDeployment();

    const Access = await ethers.getContractFactory("AssetAccessControl");
    const access = await Access.deploy(await did.getAddress());
    await access.waitForDeployment();

    return { did, access, owner, alice, bob, charlie };
  }

  it("accessPolicy - fails if sender has no DID", async function () {
    const { did, access, alice, bob } = await deployFixture();

    await did.connect(bob).registerDID("ipfs://bobDID");

    await expect(access.accessPolicy(alice.address, bob.address, 100, 10000))
                .to.be.revertedWithCustomError(access, "DIDPolicyViolation");
  });

  it("accessPolicy - fails if receiver has no DID", async function () {
    const { did, access, alice, bob } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");

    await expect(access.accessPolicy(alice.address, bob.address, 100, 10000))
                .to.be.revertedWithCustomError(access, "DIDPolicyViolation");
  });

  it("accessPolicy - fails if fee is incorrect", async function () {
    const { did, access, alice, bob } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");
    await did.connect(bob).registerDID("ipfs://bobDID");

    await expect(access.accessPolicy(alice.address, bob.address, 100, 1))
                .to.be.revertedWithCustomError(access, "FeePolicyViolation");
  });

  it("accessPolicy - succeeds if both users have DID and fee is correct", async function () {
    const { did, access, alice, bob } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");
    await did.connect(bob).registerDID("ipfs://bobDID");

    const baseFee = 100;
    const expectedFee = await access.calculateFee(baseFee);

    await expect(access.accessPolicy(alice.address, bob.address, expectedFee, baseFee));
  });

  it("accessPolicy - demonstrates diamond inheritance resolution", async function () {
    const { did, access, alice, bob, charlie } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");
    await did.connect(bob).registerDID("ipfs://bobDID");

    const baseFee = 100;
    const correctFee = await access.calculateFee(baseFee);

    // everything ok
    await expect(access.accessPolicy(alice.address, bob.address, correctFee, baseFee));

    // sender or receiver without DID
    await expect(access.accessPolicy(alice.address, charlie.address, correctFee, baseFee))
    .to.be.revertedWithCustomError(access, "DIDPolicyViolation");

    // wrong fee
    await expect(access.accessPolicy(alice.address, bob.address, 1, baseFee))
                .to.be.revertedWithCustomError(access, "FeePolicyViolation");
  });

});

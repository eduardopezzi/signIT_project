const crypto = require("crypto");
const bs58 = require("bs58");

function IPFShash(data) {
  //   const data = file;
  const hashFunction = Buffer.from("12", "hex"); // 0x20

  const digest = crypto.createHash("sha256").update(data).digest();
  console.log(digest.toString("hex")); // b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9

  const digestSize = Buffer.from(digest.byteLength.toString(16), "hex");
  console.log(digestSize.toString("hex")); // 20

  const combined = Buffer.concat([hashFunction, digestSize, digest]);
  console.log(combined.toString("hex")); // 1220b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9

  const multihash = bs58.encode(combined);
  //   console.log(multihash.toString()); // QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4
  return multihash;
}

export default IPFShash;

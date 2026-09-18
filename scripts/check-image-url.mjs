const url = process.argv[2];
if (!url) {
  console.error("usage: node scripts/check-image-url.mjs <url>");
  process.exit(1);
}

const res = await fetch(url, {
  redirect: "follow",
  headers: {
    "user-agent": "Mozilla/5.0",
    accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  },
});

console.log("status", res.status);
console.log("finalUrl", res.url);
console.log("content-type", res.headers.get("content-type"));
console.log("content-length", res.headers.get("content-length"));

const buf = Buffer.from(await res.arrayBuffer());
console.log("bytes", buf.length);
console.log("first16", buf.subarray(0, 16).toString("hex"));


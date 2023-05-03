import fs from 'fs';
import weaviate from 'weaviate-ts-client';
import path from "path";

const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
});

const getFileList = (dirName) => {
    let files = [];
    const items = fs.readdirSync(dirName, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            files = [...files, ...getFileList(`${dirName}/${item.name}`)];
        } else {
            files.push(`${dirName}/${item.name}`);
        }
    }

    return files;
};

const files = getFileList('images');
for(const file of files) {
    const img = fs.readFileSync(file);
    const b64 = Buffer.from(img).toString('base64');
    await client.data.creator()
        .withClassName('ImageStore')
        .withProperties({
            image: b64,
            text: path.basename(file)
        })
        .do();
    console.log(file);
}
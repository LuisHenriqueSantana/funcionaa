const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

class SomeService {
  async deleteItem(id) {
    const item = await this.repository.findOne(id);

    if (item?.imageUrl) {
      const key = item.imageUrl.split("/").pop();

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        })
      );
    }

    return this.repository.delete(id);
  }
}

module.exports = SomeService;

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../lib/s3";
import { randomUUID } from "crypto";
import path from "path";

export class StorageService {
  private readonly bucket = process.env.S3_BUCKET!;
  private readonly region = process.env.AWS_REGION!;
  private readonly allowedMimeTypes = ["image/png", "image/jpeg", "image/webp"];

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error("지원하지 않는 파일 형식입니다.");
    }

    const ext = path.extname(file.originalname || "").toLowerCase() || ".bin";
    const key = `${folder}/${Date.now()}-${randomUUID()}${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const urlParts = fileUrl.split(".com/");
      const key = urlParts[1];

      if (!key) return;

      await s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      console.error("S3 파일 삭제 실패:", error);
    }
  }
}

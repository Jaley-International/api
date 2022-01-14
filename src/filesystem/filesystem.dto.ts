export class UploadFileDto {
  encryptedFile: string;
  encryptedMetadata: string;
  encryptedKey: string;
  encryptedParentKey: string;
  parentId: string;
  userId: string;
}

export class UploadFolderDto {
  encryptedMetadata: string;
  encryptedKey: string;
  encryptedParentKey: string;
  parentId: string;
  userId: string;
}

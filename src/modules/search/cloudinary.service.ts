import { Injectable, BadRequestException, Logger } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dj2nkf9od';
  private readonly uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'zavlo_preset';

  /**
   * Upload de imagem para Cloudinary
   */
  async uploadImage(file: any): Promise<string> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo fornecido');
    }

    this.logger.log(`📤 [CLOUDINARY] Uploading image: ${file.originalname}`);

    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);
      formData.append('upload_preset', this.uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`❌ [CLOUDINARY] Upload failed:`, errorData);
        throw new BadRequestException('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      
      // Remover versão da URL para evitar cache issues
      const imageUrl = data.secure_url.replace(/\/v\d+\//, '/');
      
      this.logger.log(`✅ [CLOUDINARY] Upload successful: ${imageUrl}`);
      
      return imageUrl;
    } catch (error) {
      this.logger.error(`❌ [CLOUDINARY] Upload error: ${error.message}`);
      throw new BadRequestException('Erro ao fazer upload da imagem');
    }
  }

  /**
   * Upload de imagem via base64
   */
  async uploadBase64(base64Data: string): Promise<string> {
    if (!base64Data) {
      throw new BadRequestException('Dados base64 não fornecidos');
    }

    this.logger.log(`📤 [CLOUDINARY] Uploading base64 image`);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64Data,
            upload_preset: this.uploadPreset,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`❌ [CLOUDINARY] Upload failed:`, errorData);
        throw new BadRequestException('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      const imageUrl = data.secure_url.replace(/\/v\d+\//, '/');
      
      this.logger.log(`✅ [CLOUDINARY] Upload successful: ${imageUrl}`);
      
      return imageUrl;
    } catch (error) {
      this.logger.error(`❌ [CLOUDINARY] Upload error: ${error.message}`);
      throw new BadRequestException('Erro ao fazer upload da imagem');
    }
  }

  /**
   * Deletar imagem do Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    this.logger.log(`🗑️ [CLOUDINARY] Deleting image: ${publicId}`);

    try {
      // Implementar se necessário
      // Requer API key e secret
      this.logger.warn(`⚠️ [CLOUDINARY] Delete not implemented yet`);
    } catch (error) {
      this.logger.error(`❌ [CLOUDINARY] Delete error: ${error.message}`);
    }
  }
}

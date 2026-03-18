import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Faz upload de um arquivo para o Supabase Storage
 * @param file Arquivo a ser enviado
 * @returns URL pública do arquivo ou null em caso de erro
 */
export const uploadFile = async (
  file: File
): Promise<string | null> => {
  try {
    // Gera um nome único para o arquivo para evitar conflitos
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Determina o caminho com base no tipo de arquivo
    let filePath = '';
    if (file.type.startsWith('image/')) {
      filePath = `news/images/${fileName}`;
    } else if (file.type.startsWith('video/')) {
      filePath = `news/videos/${fileName}`;
    } else {
      filePath = `news/files/${fileName}`;
    }

    console.log(`Iniciando upload do arquivo para media/${filePath}`);
    
    // Faz o upload do arquivo
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      console.error('Mensagem:', error.message);
      throw new Error(`Erro no upload: ${error.message}`);
    }

    console.log('Upload concluído com sucesso:', data?.path);
    
    // Obtém a URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    console.log('URL pública gerada:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Erro detalhado ao processar upload:', error);
    throw new Error(error.message || 'Falha no upload do arquivo');
  }
};

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param file Arquivo de imagem a ser enviado
 * @returns URL pública da imagem ou null em caso de erro
 */
export const uploadImage = async (file: File): Promise<string | null> => {
  // Verifica se o arquivo é uma imagem
  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo deve ser uma imagem');
  }
  
  return uploadFile(file);
};

/**
 * Faz upload de um vídeo para o Supabase Storage
 * @param file Arquivo de vídeo a ser enviado
 * @returns URL pública do vídeo ou null em caso de erro
 */
export const uploadVideo = async (file: File): Promise<string | null> => {
  // Verifica se o arquivo é um vídeo
  if (!file.type.startsWith('video/')) {
    throw new Error('O arquivo deve ser um vídeo');
  }
  
  return uploadFile(file);
}; 
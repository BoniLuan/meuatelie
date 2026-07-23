import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const PHOTO_DIR = FileSystem.documentDirectory + 'photos/';

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }
}

async function persist(srcUri: string): Promise<string> {
  await ensureDir();
  const ext = srcUri.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = `${PHOTO_DIR}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await FileSystem.copyAsync({ from: srcUri, to: dest });
  return dest;
}

/**
 * Abre a câmera ou a galeria e retorna o caminho persistido da foto (ou null se cancelado).
 * Lança erro com mensagem amigável se a permissão for negada.
 */
export async function pickPhoto(source: 'camera' | 'library'): Promise<string | null> {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('Precisamos da permissão da câmera para tirar a foto.');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (res.canceled) return null;
    return persist(res.assets[0].uri);
  }

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Precisamos da permissão da galeria para escolher a foto.');
  const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
  if (res.canceled) return null;
  return persist(res.assets[0].uri);
}

/** Remove o arquivo físico da foto (ignora se já não existir). */
export async function deletePhotoFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // silencioso: o registro no banco já foi/será removido
  }
}

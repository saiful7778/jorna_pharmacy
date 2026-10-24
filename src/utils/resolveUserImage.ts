export const USER_PLACEHOLDER_IMAGE = "/user_placeholder_img.png";

export function resolveUserImage(image: string | null | undefined): string {
  return image || USER_PLACEHOLDER_IMAGE;
}

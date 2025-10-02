import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

NONCE_LENGTH = 12
AUTHTAG_LENGTH = 16
CIPHER_HEAD_LENGTH = NONCE_LENGTH + AUTHTAG_LENGTH
RANDOM_MIN_ENTROPY = 32


def encrypt_symetric(key: str, data: str, nonce: bytes = None) -> str:
    """
    Encrypt data using AES-256-GCM with the given key.

    Args:
        key: The encryption key
        data: The data to encrypt

    Returns:
        Base64 encoded encrypted data
    """
    buffer = encrypt(key, data, nonce)
    return base64.b64encode(buffer).decode("utf-8")


def decrypt_symetric(key: str, data: str) -> str:
    """
    Decrypt data using AES-256-GCM with the given key.

    Args:
        key: The encryption key
        data: Base64 encoded encrypted data

    Returns:
        Decrypted data
    """
    cipher = base64.b64decode(data)
    return decrypt(key, cipher)


def encrypt(key: str, data: str, nonce: bytes = None) -> bytes:
    """
    Internal encryption function.

    Args:
        key: The encryption key
        data: The data to encrypt

    Returns:
        Bytes containing nonce + tag + ciphertext
    """
    if isinstance(key, str):
        key = key.encode()

    if nonce is None:
        nonce = os.urandom(NONCE_LENGTH)

    aesgcm = AESGCM(key)

    ciphertext = aesgcm.encrypt(nonce, data.encode("utf-8"), None)

    # In Python's AESGCM, the tag is included at the end of ciphertext
    # Extract tag and actual ciphertext
    tag = ciphertext[-AUTHTAG_LENGTH:]
    actual_ciphertext = ciphertext[:-AUTHTAG_LENGTH]

    return nonce + tag + actual_ciphertext


def decrypt(key: str, cipher: bytes) -> str:
    """
    Internal decryption function.

    Args:
        key: The encryption key
        cipher: Bytes containing nonce + tag + ciphertext

    Returns:
        Decrypted data
    """
    if isinstance(key, str):
        key = key.encode()

    if len(cipher) <= CIPHER_HEAD_LENGTH:
        raise ValueError("Authentication failed!")

    nonce = cipher[:NONCE_LENGTH]
    tag = cipher[NONCE_LENGTH:CIPHER_HEAD_LENGTH]
    ciphertext = cipher[CIPHER_HEAD_LENGTH:]

    aesgcm = AESGCM(key)

    try:
        # Reconstruct the format expected by AESGCM
        ciphertext_with_tag = ciphertext + tag
        plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, None)
        return plaintext.decode("utf-8")
    except Exception:  # noqa: BLE001
        raise ValueError("Authentication failed!")  # noqa: B904


def extract_nonce(encoded_data: str) -> bytes:
    """
    Extract the nonce from encoded data.

    Args:
        encoded_data: Base64 encoded data

    Returns:
        The nonce bytes
    """
    decoded = base64.b64decode(encoded_data)
    return decoded[:NONCE_LENGTH]

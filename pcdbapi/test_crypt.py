import base64
import os

import pytest

import crypt

# Test values
CLIENT_SECRET_CIPHER_PASS = "JZBlwxfKnbn/RV025aw+dQxk+xoQT+Yr"  # noqa: S105
encoded = "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0="
expected_decoded = "a970fc88b3111fcfdce515c2ee03488d8a349e5379a3ba2aa48c225dcea243a5"
nonce = crypt.extract_nonce(encoded)


def test_decrypt_symetric():
    # Decrypt the client secret
    decrypted = crypt.decrypt_symetric(CLIENT_SECRET_CIPHER_PASS, encoded)

    # Check if it matches the expected value
    assert decrypted == expected_decoded


def test_encrypt_symetric():
    # Encrypt the client secret
    encrypted = crypt.encrypt_symetric(CLIENT_SECRET_CIPHER_PASS, expected_decoded, nonce)

    # Check if it matches the expected value
    assert encrypted == encoded


def test_decrypt_too_short_cipher():
    # Create a cipher that's too short
    short_cipher = base64.b64encode(b"too_short").decode("utf-8")

    # Check that it raises the correct exception
    with pytest.raises(ValueError, match="Authentication failed!"):
        crypt.decrypt_symetric(CLIENT_SECRET_CIPHER_PASS, short_cipher)


def test_decrypt_invalid_tag():
    # Decode the original cipher
    decoded = base64.b64decode(encoded)

    # Corrupt the tag portion (bytes 12-28)
    corrupted = (
        decoded[: crypt.NONCE_LENGTH]
        + b"\x00" * crypt.AUTHTAG_LENGTH
        + decoded[crypt.CIPHER_HEAD_LENGTH :]
    )
    corrupted_encoded = base64.b64encode(corrupted).decode("utf-8")

    # Check that it raises the correct exception
    with pytest.raises(ValueError, match="Authentication failed!"):
        crypt.decrypt_symetric(CLIENT_SECRET_CIPHER_PASS, corrupted_encoded)

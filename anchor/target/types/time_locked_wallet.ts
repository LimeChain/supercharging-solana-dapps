/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/time_locked_wallet.json`.
 */
export type TimeLockedWallet = {
  "address": "",
  "metadata": {
    "name": "timeLockedWallet",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "closeWallet",
      "discriminator": [
        35,
        212,
        234,
        224,
        244,
        208,
        31,
        204
      ],
      "accounts": [
        {
          "name": "wallet",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "wallet"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "createWallet",
      "discriminator": [
        82,
        172,
        128,
        18,
        161,
        207,
        88,
        63
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "wallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "releaseTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "wallet"
          ]
        },
        {
          "name": "wallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "wallet",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "wallet"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "wallet",
      "discriminator": [
        24,
        89,
        59,
        139,
        81,
        154,
        232,
        95
      ]
    }
  ],
  "types": [
    {
      "name": "wallet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "releaseTime",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

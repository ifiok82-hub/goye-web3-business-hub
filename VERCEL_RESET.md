# Vercel Environment Reset Instructions

Go to Vercel Dashboard > goye-web3-business-hub > Settings > Environment Variables
Delete old PI_API_KEY if exists.
Add new:
- Name: PI_API_KEY
  Value: 4sup304m5joyhqnmhmiov2tdjvybp4l9pr7a9qe47nf9nri4dzyczexm1dmmei2r
- Name: NEXT_PUBLIC_PI_API_URL
  Value: https://api.testnet.minepi.com
- Name: NEXT_PUBLIC_PI_NETWORK
  Value: testnet
- Name: GOYE_TESTNET_WALLET
  Value: GDDTB2ND3AZU7BY36A7N5CHLO63XMXVSGNCMXOIDZI7FUP5GI3P7X24E
- Name: GOYE_KYC_WALLET
  Value: GBR4B47WY7JDK2JKUUQQTWWQENOUUYTAQAOYLXZ7XE36YFQY6LKPVO6R

Redeploy with cache OFF.

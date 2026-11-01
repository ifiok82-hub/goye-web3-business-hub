export default function handler(_req: any, res: any) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send('piappstudio-r355EFVwC0FjNDTVL5bWiqchPNFIqMA5');
}

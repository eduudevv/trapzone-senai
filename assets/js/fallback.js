// Dados locais: usados se a API do Deezer falhar (modo demonstração, sem áudio).
const FB_ARTISTS = ['Ryu, the Runner','GA','Niink','Trux','Jovem Dex','Jé','Derek','Ghard','luangelus','Phl Notunrboy'];
const FALLBACK = {};
['Em alta no Trap BR','Trap Melódico','Rimas e Flow','Nova Geração','Underground','Romântico'].forEach((c, ci) => {
  FALLBACK[c] = Array.from({length: 10}, (_, i) => ({
    id: -(ci * 100 + i + 1), title: `Faixa demo ${String(i + 1).padStart(2, '0')}`,
    artist: FB_ARTISTS[(ci + i) % FB_ARTISTS.length], artistId: 0, cover: '', album: 'Demonstração', preview: '', dur: 30
  }));
});

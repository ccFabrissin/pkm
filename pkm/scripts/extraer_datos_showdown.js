// Extrae datos de Reg M-C (mod "champions" de Pokémon Showdown) a data.json
const fs = require('fs');
const load = f => {
  let src = require('node:module').stripTypeScriptTypes(fs.readFileSync(f, 'utf8')).replace(/export const \w+\s*=\s*\{/, 'module.exports = {');
  const m = {exports: {}};
  new Function('module', 'exports', src)(m, m.exports);
  return m.exports;
};
const loadJs = (f, key) => { const e = {}; new Function('exports', fs.readFileSync(f, 'utf8'))(e); return e[key]; };

const dex = JSON.parse(fs.readFileSync('pokedex.json', 'utf8'));
const baseMoves = JSON.parse(fs.readFileSync('moves.json', 'utf8'));
const baseItems = loadJs('items.js', 'BattleItems');
const baseAbil = loadJs('abilities.js', 'BattleAbilities');
const cFormats = load('champ-formats-data.ts');
const cItems = load('champ-items.ts');
const cMoves = load('champ-moves.ts');
const cAbil = load('champ-abilities.ts');
const cLearn = load('champ-learnsets.ts');

const merge = (base, mod) => {
  const out = {};
  for (const id of new Set([...Object.keys(base), ...Object.keys(mod)])) {
    out[id] = mod[id] ? (mod[id].inherit ? {...base[id], ...mod[id]} : mod[id]) : base[id];
  }
  return out;
};
const items = merge(baseItems, cItems), moves = merge(baseMoves, cMoves), abil = merge(baseAbil, cAbil);

const species = [];
for (const [id, fd] of Object.entries(cFormats)) {
  if (fd.isNonstandard || fd.tier === 'Illegal') continue;
  const s = dex[id]; if (!s) { console.error('sin dex', id); continue; }
  species.push({
    id, name: s.name, num: s.num, base: s.baseSpecies || s.name, forme: s.forme || '',
    mega: /Mega/.test(s.forme || ''), types: s.types, abilities: Object.values(s.abilities),
    stats: s.baseStats, bst: Object.values(s.baseStats).reduce((a, b) => a + b, 0),
    weight: s.weightkg, requiredItem: s.requiredItem || '', tier: fd.tier,
  });
}
const toId = n => n.toLowerCase().replace(/[^a-z0-9]/g, '');
const learnFor = sp => {
  const tries = [sp.id, toId(sp.base), toId(dex[sp.id].changesFrom || ''), toId(dex[sp.id].battleOnly || '')];
  for (const t of tries) if (t && cLearn[t] && cLearn[t].learnset) return Object.keys(cLearn[t].learnset);
  return [];
};
const learnsets = {};
for (const sp of species) learnsets[sp.id] = learnFor(sp);

const legalMoves = new Set(Object.values(learnsets).flat());
const moveList = [...legalMoves].filter(id => moves[id]).map(id => {
  const m = moves[id];
  return {id, name: m.name, type: m.type, cat: m.category, bp: m.basePower || 0,
    acc: m.accuracy === true ? '-' : m.accuracy, pp: m.pp, prio: m.priority || 0,
    target: m.target, desc: m.shortDesc || m.desc || '',
    flags: Object.keys(m.flags || {}).filter(f => ['contact', 'sound', 'punch', 'bite', 'slicing', 'pulse', 'bullet', 'wind', 'powder'].includes(f))};
}).sort((a, b) => a.name.localeCompare(b.name));

const itemList = Object.entries(items).filter(([id, it]) => it && it.name && !it.isNonstandard)
  .map(([id, it]) => ({id, name: it.name, megaStone: !!it.megaStone,
    megaFor: it.megaStone ? Object.keys(it.megaStone).join(', ') + ' → ' + Object.values(it.megaStone).join(', ') : '',
    desc: it.shortDesc || it.desc || '', sprite: it.spritenum || 0, berry: !!it.isBerry}))
  .sort((a, b) => (a.megaStone - b.megaStone) || a.name.localeCompare(b.name));

const abilIds = new Set(species.flatMap(s => s.abilities.map(toId)));
const abilList = [...abilIds].map(id => abil[id] ? {id, name: abil[id].name, desc: abil[id].shortDesc || abil[id].desc || ''} : {id, name: id, desc: ''})
  .sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync('data.json', JSON.stringify({species, learnsets, moves: moveList, items: itemList, abilities: abilList}));
console.log('especies', species.length, 'megas', species.filter(s => s.mega).length,
  'movs', moveList.length, 'objetos', itemList.length, 'megapiedras', itemList.filter(i => i.megaStone).length,
  'habilidades', abilList.length, 'sin learnset', species.filter(s => !learnsets[s.id].length).map(s => s.id));
console.log(itemList.filter(i => !i.megaStone).map(i => i.name).join(', '));

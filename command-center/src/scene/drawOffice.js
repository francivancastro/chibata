// Static architecture is independent from the observed agent inventory.
export const officeSize = { width: 1280, height: 720 }

export const workstations = [
  { x: 544, y: 234 }, { x: 946, y: 234 }, { x: 190, y: 538 },
  { x: 570, y: 538 }, { x: 990, y: 538 }, { x: 694, y: 234 },
  { x: 740, y: 538 }, { x: 1090, y: 234 }
]

export function drawOffice(scene) {
  const g = scene.add.graphics()
  const rect = (x, y, w, h, color, radius = 0, alpha = 1) => {
    g.fillStyle(color, alpha)
    if (radius) g.fillRoundedRect(x, y, w, h, radius)
    else g.fillRect(x, y, w, h)
  }
  const text = (x, y, value, size = 13, color = '#52605b') => scene.add.text(x, y, value, { fontFamily: 'system-ui, sans-serif', fontSize: `${size}px`, color, fontStyle: 'bold', letterSpacing: 2 })
  const plant = (x, y, scale = 1) => {
    g.fillStyle(0x34493b, .12).fillEllipse(x + 5, y + 15, 48 * scale, 18 * scale)
    rect(x - 11 * scale, y, 22 * scale, 23 * scale, 0xb98364, 5)
    g.fillStyle(0x355e48).fillEllipse(x - 11 * scale, y - 9 * scale, 24 * scale, 36 * scale)
    g.fillStyle(0x66866a).fillEllipse(x + 11 * scale, y - 13 * scale, 24 * scale, 39 * scale)
    g.fillStyle(0x8da27b).fillEllipse(x, y - 23 * scale, 17 * scale, 33 * scale)
  }
  const desk = (x, y, w = 126) => {
    rect(x + 5, y + 10, w, 63, 0x34403b, 9, .14)
    rect(x + 8, y + 51, 8, 26, 0x8f765d, 2)
    rect(x + w - 16, y + 51, 8, 26, 0x8f765d, 2)
    rect(x, y, w, 61, 0xb89570, 7)
    rect(x, y, w, 54, 0xe0c39d, 7)
    rect(x + 23, y + 5, 65, 34, 0x303c38, 4)
    rect(x + 27, y + 9, 57, 24, 0x789c9d, 2)
    rect(x + 31, y + 13, 26, 3, 0xd2e6db, 1)
    rect(x + 31, y + 20, 41, 2, 0xa9c5bd, 1)
    rect(x + 49, y + 39, 14, 4, 0x52615a, 2)
    rect(x + 32, y + 46, 49, 8, 0xf5f1e9, 2)
    g.fillStyle(0xf9f5ed).fillCircle(x + w - 17, y + 38, 7)
    g.fillStyle(0x775c48).fillCircle(x + w - 17, y + 38, 4)
    rect(x + 41, y + 72, 42, 30, 0x566b60, 9)
    rect(x + 43, y + 92, 38, 12, 0x3e5249, 5)
  }
  const room = (x, y, w, h, title, number, floor = 0xf3efe6) => {
    rect(x + 6, y + 15, w, h, 0x49564a, 8, .13)
    rect(x, y, w, h, floor, 5)
    for (let row = y + 22; row < y + h; row += 26) rect(x + 3, row, w - 6, 1, 0xc5bba8, 0, .22)
    rect(x, y - 16, w, 24, 0xfaf9f4, 3)
    rect(x, y + 8, w, 8, 0xb7beb0)
    rect(x, y, 9, h, 0xd6d9cd)
    rect(x + w - 9, y, 9, h, 0xd6d9cd)
    rect(x, y + h - 7, w * .39, 7, 0xb7beb0)
    rect(x + w * .64, y + h - 7, w * .36, 7, 0xb7beb0)
    text(x + 21, y + 27, number, 11, '#aa784f')
    text(x + 51, y + 25, title)
  }

  rect(0, 0, 1280, 720, 0xe8ece5)
  // A single raised floor plate makes the layout read as one office.
  rect(30, 46, 1220, 644, 0x34493b, 22, .10)
  rect(22, 27, 1236, 640, 0xc5cabb, 16)
  rect(22, 22, 1236, 635, 0xe3ddcf, 16)
  for (let y = 45; y < 650; y += 29) rect(30, y, 1220, 1, 0xc3b8a4, 0, .35)
  room(50, 67, 306, 233, 'LOUNGE', '01', 0xe9ede2)
  room(382, 67, 416, 233, 'NÚCLEO CODEX', '02')
  room(824, 67, 406, 233, 'ATELIÊ DE DESIGN', '03')
  room(50, 388, 306, 230, 'PRODUTO', '04')
  room(382, 388, 416, 230, 'ENGENHARIA', '05')
  room(824, 388, 406, 230, 'PESQUISA & ARQUIVO', '06', 0xe9ede2)
  // Lounge: upholstered seating, rug, side table and indoor planting.
  rect(94, 157, 207, 101, 0xd3d1bb, 13)
  rect(91, 133, 153, 46, 0x69816b, 10)
  rect(97, 132, 66, 37, 0x8b9c80, 7)
  rect(167, 132, 69, 37, 0x8b9c80, 7)
  rect(271, 157, 40, 78, 0x8b9c80, 9)
  rect(157, 198, 87, 39, 0xb49370, 17)
  rect(154, 193, 87, 37, 0xebd4ad, 17)
  rect(176, 201, 25, 16, 0xf8f5ea, 2)
  plant(315, 118, .8)
  desk(473, 150)
  desk(640, 150)
  desk(883, 150)
  desk(1045, 150)
  desk(118, 453)
  desk(498, 453)
  desk(663, 453)
  desk(922, 453)
  // Pinboard, material swatches and archive joinery.
  rect(82, 420, 230, 17, 0x587369, 3)
  for (let i = 0; i < 5; i++) rect(94 + i * 42, 423, 28, 11, [0xd0b16e, 0xe6d9bd, 0xb8cbb4][i % 3], 2)
  rect(1120, 437, 75, 145, 0x9c896c, 4)
  for (let row = 0; row < 4; row++) {
    rect(1126, 448 + row * 32, 63, 25, 0x796d59, 2)
    for (let i = 0; i < 6; i++) rect(1130 + i * 9, 451 + row * 32, 6, 20, [0xc5cbb2, 0xe6d3ad, 0x9bafa3][(i + row) % 3], 1)
  }
  plant(80, 570, .8)
  plant(767, 114, .75)
  plant(850, 573, .8)
  plant(325, 572, .8)
  plant(1191, 114, .75)
  plant(1170, 342, .75)
  text(72, 333, 'C O M M A N D   C E N T E R', 15, '#777e6f')
  text(874, 337, 'ESTÚDIO  /  PISO 01', 11, '#777e6f')
  // Glazing in the back wall; no operational signals are painted here.
  for (const x of [413, 540, 667, 855, 982, 1109]) {
    rect(x, 52, 99, 15, 0xa9c1ba, 2)
    rect(x + 3, 54, 92, 3, 0xe5f0e7)
  }
}

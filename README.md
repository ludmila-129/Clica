[README.md](https://github.com/user-attachments/files/32938800/README.md)
# ¡Clica! algunas notas

Para ver las zonas clicables y sus coordenadas: `index.html?debug=1`.

## Estructura
- `index.html`  pantallas y estilos (colores, botones, marcos, tipografía)
- `game.js`     lógica: tipos de misión, tutorial y texto de Ayuda & FAQ
- `levels.js`   los 12 niveles de A1: escenas, zonas, textos y respuestas
- `assets/scenes/`  fondos de cada nivel · `assets/sprites/`  objetos (PNG transparente)
- `assets/avatars/` `avatar1.png`…`avatar8.png` (de frente; también `_espalda`, `_lado1`, `_lado2`)
- `assets/ui/`  botones, marcos, iconos y fondo del menú · `assets/fonts/`  tipografía

## Apariencia de botones y recuadros (pixel art)
Todo se dibuja con "9-slice": una imagen pequeña cuyas esquinas se mantienen y cuyo centro se estira.

## Tutorial y ayuda
Texto del tutorial: función `tut()` en `game.js`. Textos de Ayuda & FAQ (ES/EN): objeto `FAQ` en `game.js`.
El botón "Más juegos" es el enlace de `index.html` (`MÁS JUEGOS`).

## Orden actual de los niveles de A1 (12)
1 cuchara · 2 frutas · 3 lista de compras · 4 pagar con tarjeta · 5 ir al banco · 6 teclado del banco ·
7 volver en moto · 8 autos azules · 9 gato al sillón · 10 jarrón sobre la mesa · 11 ducharse · 12 jersey.

## Distribución en ordenador
En pantallas anchas (≥ 900 px) la escena va a la izquierda y la lista, los avisos y el botón CONTINUAR a la derecha;
la escena se ajusta a la altura de la ventana para no tener que hacer zoom out. En móvil todo se apila.
Los valores están al final del `<style>` de `index.html` (`.play`, `.stage`, `.side`).

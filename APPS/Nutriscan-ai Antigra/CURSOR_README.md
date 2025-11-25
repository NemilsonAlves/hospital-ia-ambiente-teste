# 🍎 Cursor Dinâmico de Frutas

## Descrição
Este projeto implementa um cursor personalizado que muda automaticamente entre diferentes frutas a cada 3 segundos, criando uma experiência visual única e divertida relacionada ao tema de nutrição.

## 🍓 Frutas Disponíveis
1. **Maçã** 🍎 - Vermelha com folha verde
2. **Banana** 🍌 - Amarela com manchas marrons
3. **Laranja** 🍊 - Laranja com textura pontilhada
4. **Uvas** 🍇 - Roxas em formato de cacho
5. **Morango** 🍓 - Vermelho com sementes amarelas

## 🎨 Implementação
- **SVGs Customizados**: Cada fruta é um arquivo SVG vetorial com gradientes e detalhes
- **Hook React**: `useDynamicCursor` gerencia a rotação automática
- **Intervalo**: Muda a cada 3 segundos
- **Responsivo**: Funciona em todos os elementos interativos (botões, links)

## 📁 Arquivos
- `/public/apple-cursor.svg`
- `/public/banana-cursor.svg`
- `/public/orange-cursor.svg`
- `/public/grape-cursor.svg`
- `/public/strawberry-cursor.svg`
- `/src/hooks/useDynamicCursor.js`

## 🚀 Como Usar
O hook é automaticamente ativado no componente `App.jsx`:

```jsx
import useDynamicCursor from './hooks/useDynamicCursor'

function App() {
  useDynamicCursor(); // Ativa o cursor dinâmico
  // ...
}
```

## ⚙️ Personalização
Para ajustar o intervalo de troca, edite o arquivo `useDynamicCursor.js`:

```javascript
// Mudar de 3000ms (3s) para outro valor
const intervalId = setInterval(changeCursor, 3000);
```

Para adicionar mais frutas:
1. Crie um novo arquivo SVG em `/public/`
2. Adicione o caminho no array `fruitCursors`

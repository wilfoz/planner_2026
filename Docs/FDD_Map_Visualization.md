# Feature Design Doc (FDD) - Visualização de Mapa 3D

## 1. Contexto e Motivação
A visualização espacial das obras é crítica para o planejamento e acompanhamento. A implementação atual 2D é insuficiente para identificar desafios de relevo e conexões complexas de cabos. O objetivo é prover uma visão 3D realista e interativa.

## 2. Objetivos Técnicos
*   Renderizar torres como modelos 3D (.gltf/.glb) geolocalizados.
*   Renderizar cabos conectando torres usando curvas catenárias (simulando física real).
*   Exibir relevo do terreno (Terrain-DEM).
*   Permitir interação (clique, zoom, rotação) fluida.
*   Performance: Renderizar mapa inicial em < 3 segundos.

## 3. Escopo
*   **In Scope:** Visualização de Torres, Cabos, Terreno, Neblina, Popups de Informação.
*   **Out of Scope:** Edição de coordenadas arrastando no mapa (nesta versão), simulação climática avançada.

## 4. Detalhes de Implementação

### 4.1 Arquitetura do Componente (Frontend)
O módulo de mapa será composto por:

*   **`MapComponent` (Container):** Gerencia o estado do mapa (Mapbox instance), controles de UI e orquestra as camadas.
*   **`DeckLayerDirective`:** Diretiva Angular responsável por instanciar e atualizar o `MapboxOverlay` do Deck.gl.
*   **`TowerService`:** Busca dados das torres no Backend.

### 4.2 Integração Mapbox + Deck.gl
A integração utilizará o modo `interleaved` para garantir que objetos 3D do Deck.gl respeitem a profundidade (Z-buffer) do terreno do Mapbox.

```typescript
// Exemplo de configuração no DeckLayerDirective
this.overlay = new MapboxOverlay({
  interleaved: true,
  layers: [
    new ScenegraphLayer({
      id: 'towers-3d',
      data: this.towersData,
      scenegraph: 'assets/models/tower.gltf',
      getPosition: d => [d.lng, d.lat, d.elevation],
      getOrientation: d => [0, d.rotation, 90],
      sizeScale: 1,
      _lighting: 'pbr'
    }),
    // Camada de cabos (catenária) aqui
  ]
});
this.map.addControl(this.overlay);
```

### 4.3 Cálculo de Catenária (Matemática)
Para desenhar os cabos, o Frontend calculará pontos intermediários formando uma parábola (catenária) entre duas torres.
*   **Input:** Ponto A (lat, lng, alt), Ponto B (lat, lng, alt), Flecha (sag).
*   **Output:** Array de coordenadas [x, y, z] para desenhar a linha.

### 4.4 Contratos de API (Interfaces)

**GET /towers**
```json
[
  {
    "id": "uuid",
    "cod": "T-01",
    "type": "SUSPENSION",
    "geo": {
      "lat": -23.55,
      "lng": -46.63,
      "elevation": 760
    },
    "connections": ["uuid-tower-next"] 
  }
]
```

## 5. Fluxos de Erro
*   **Modelo 3D não encontrado:** Exibir fallback (cilindro genérico ou marcador 2D).
*   **Falha na API:** Exibir toast de erro e tentar recarregar.
*   **WebGL não suportado:** Detectar e exibir mensagem amigável ou mapa 2D simplificado.

## 6. Critérios de Aceite
1.  Mapa carrega e exibe terreno 3D.
2.  Torres aparecem na localização correta com modelo 3D.
3.  Cabos conectam torres com curvatura visível.
4.  Performance mantém 60fps na navegação padrão.
5.  Clique na torre abre popup com código e tipo.

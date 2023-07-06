import { Scene } from "phaser";
import { CONFIG } from "../config";
import Player from "../entities/Player";
import Touch from "../entities/Touch";
import Fazenda from "./Fazenda";

export default class Casa extends Scene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map;

    /**@type {Player} */
    player;
    touch;

    isTouching = false;
    layers = {};

    grupObject;
    constructor() {
        super('Casa')
    }

    preload() {
        
    //Carregando os dados do mapa
    this.load.tilemapTiledJSON('casa', '../mapas/casa.json');

     //caregando os tilessets do mapa IMAGENS
    this.load.image('tiles-geral', '../mapas/tiles/geral.png');

    //importando um spritesheet
    this.load.spritesheet('player', '../mapas/tiles/player.png', {
        frameWidth: 48,
        frameHeight: 48
    });
  }

  create() {
    this.createMap();
    this.createLayers();
    this.createPlayer();
    this.createObjects();
    this.createColliders();
    this.createCamera();
    
  }

  createMap(){
    this.map = this.make.tilemap({
        key: 'casa',
        tileWidth: CONFIG.TILE_SIZE,
        tileHeight: CONFIG.TILE_SIZE,
      })
  
      this.map.addTilesetImage('geral', 'tiles-geral');
    }

    createPlayer() {
        this.touch = new Touch(this, 22 * 11, 18 * 13);
        this.player = new Player(this, 16 * 14.5, 16 * 23.5, this.touch);
        this.player.setDepth(1);
    }

    createLayers() {
        const tilesGeral = this.map.getTileset('geral')

        const layerNames = this.map.getTileLayerNames();
        for (let i = 0; i < layerNames.length; i++) {
            const name = layerNames[i];        
            this.layers[name] = this.map.createLayer(name, [tilesGeral], 0, 0);
            this.layers[name].setDepth(i);
            if(name.endsWith('Collision') ) {
                this.layers[name].setCollisionByProperty({collider: true});

                if ( CONFIG.DEBUG_COLLISION ) {
                    const debugGraphics = this.add.graphics().setAlpha(0.75).setDepth(i);
                    this.layers[name].renderDebug(debugGraphics, {
                        tileColor: null, // Color of non-colliding tiles
                        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
                    });
                }
            }

        }
    }
    createCamera() {
        const mapWidth = this.map.width * CONFIG.TILE_SIZE;
        const mapHeight = this.map.height * CONFIG.TILE_SIZE;

        this.cameras.main.setBounds(0,0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player);
    }
   
    createColliders() {
        //criando colisão entre o Player e as camadas de colisão do Tiled
        const layerNames = this.map.getTileLayerNames();
        for (let i = 0; i < layerNames.length; i++) {
            const name = layerNames[i];

            if(name.endsWith('Collision') ) {
                this.physics.add.collider(this.player, this.layers[name]);
            }
        }
        //ativando bordinhas
        this.physics.add.overlap(this.touch, this.groupObjects, this.handleTouch, undefined, this);

    }

    createObjects() {
        this.grupObject = this.physics.add.group();
        const objects = this.map.createFromObjects('Objetos', [
          { name: 'porta'},
        ]);
    
        this.physics.world.enable(objects);
    
        for (let i = 0; i < objects.length; i++) {
          const obj = objects[i]
          const prop = this.map.objects[0].objects[i]
    
          obj.setDepth(this.layers.length + 1);
          obj.setVisible(false);
          obj.prop = this.map.objects[0].objects[i].properties;
          this.grupObject.add(obj);
        }
    }

    
    handleTouch(touch, objects) {
        if (this.isTouching && this.player.isAction) {
          return;
        }
    
        if (this.isTouching && !this.player.isAction) {
          this.isTouching = false;
          return;
        }
    
        if (this.player.isAction) {
          if (objects.name === 'porta') {
            this.scene.switch('Fazenda')
          }
        }

       
    }



}
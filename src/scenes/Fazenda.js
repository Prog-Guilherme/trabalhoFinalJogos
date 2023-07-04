import { Scene } from "phaser";
import { CONFIG } from "../config";
import Player from "../entities/Player";
import Touch from "../entities/Touch";

export default class Fazenda extends Scene {

    /**@type {Phaser.Tilemaps.Tilemap} */
    map;

    layers = {};

    /** @type {Player} */
    player;

    touch;

    /** @type {Phaser.Physics.Arcade.Group} */
    groupObjects;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    groupObjects;

    isTouching = false;

    constructor() {
        super('Fazenda'); // Salvando o nome desta Cena
    }

    preload() {
        // Carregar os dados do mapa
        this.load.tilemapTiledJSON('tilemap-fazenda-info', 'mapas/fazenda.json');

        // Carregar os tilesets do map (as imagens)
        this.load.image('tiles-fazenda', 'mapas/tiles/geral.png');

        //Importando um spritesheet
        this.load.spritesheet('player', 'mapas/tiles/player.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet('vaca', 'mapas/tiles/vacas_anim.png', {
            frameWidth: CONFIG.TILE_SIZE * 2,
            frameHeight: CONFIG.TILE_SIZE * 2
       });

       this.load.spritesheet('spriteGeral', 'mapas/tiles/geral.png', {
        frameWidth: CONFIG.TILE_SIZE,
        frameHeight: CONFIG.TILE_SIZE
       });
    }

    create(){
        this.createMap();
        this.createLayers();
        this.createPlayer();
        this.createObjects();
        this.createColliders();
        this.createCamera();
    }

    update(){
        
    }

    createPlayer() {
        this.touch = new Touch(this, 50, 50);
        this.player = new Player(this, 16*10, 16*4, this.touch);
        this.player.setDepth(2);
    }

    createMap() {
        this.map = this.make.tilemap({
            key: 'tilemap-fazenda-info',
            tileWidth: CONFIG.TILE_SIZE,
            tileHeight: CONFIG.TILE_SIZE
        });

        //Fazendo a correspondencia entre as imagens usadas no Tiled
        // e as carregadas pelo Phaser
        this.map.addTilesetImage('geral', 'tiles-fazenda');

    }

    // Automatizando
    createLayers() {
        //Pegando os tilesets (usar os nomes do Tiled)
        const tilesFazenda = this.map.getTileset('geral');

        const layerNames = this.map.getTileLayerNames();
        for (let i = 0; i < layerNames.length; i++) {
            const name = layerNames[i];
            console.log(name)

            this.layers[name] = this.map.createLayer(name, [tilesFazenda], 0, 0);
            // Definindo a profundidade  de cada camada
            this.layers[name].setDepth(i);

            // Verificando se o layer possui colisão
            if ( name.endsWith('Collision') ) {
                this.layers[name].setCollisionByProperty({ collider: true });

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

    createObjects() {
        // Criar um grupo para os objetos
        this.groupObjects = this.physics.add.group();

        const objects = this.map.createFromObjects("objetos", [
            { name: "couveflor" },
            { name: "milho" },
            { name: "beringela" },
            { name: "cenoura" },
            { name: "regador" },
            { name: "porta" },
            { name: "espacomilho" },
            { name: "espacoberingela" },
            { name: "espacocenoura" },
            { name: "espacocouveflor" },
        ]);
        

        // Tornando todos os objetos, Sprites com Physics (que possuem body)
        this.physics.world.enable(objects);

        for(let i = 0; i < objects.length; i++){
            //Pegando o objeto atual
            const obj = objects[i];
            //Pegando as informações do Objeto definidas no Tiled
            const prop = this.map.objects[0].objects[i];
        
            obj.setDepth(this.layers.length + 1);
            obj.setVisible(false);
            obj.prop = this.map.objects[0].objects[i].properties;

            console.log(obj.x, obj.y);

            this.groupObjects.add(obj);
        }
    }

    createCamera() {
        const mapWidht = this.map.width * CONFIG.TILE_SIZE;
        const mapHeight = this.map.height * CONFIG.TILE_SIZE;

        this.cameras.main.setBounds(0,0, mapWidht, mapHeight);
        this.cameras.main.startFollow(this.player);
    }

    createColliders() {
        // Diferença COLIDER x OVERLAP
        // COLLIDER: colide e impede a passagem
        // Overlap: detecta a sobreposição dos elementos, não impede a passagem

        // Criando colisão entre o player e as camadas de colisão do Tiled
        const layerNames = this.map.getTileLayerNames();
        for (let i = 0; i < layerNames.length; i++) {
            const name = layerNames[i];

            if( name.endsWith('Collision')) {
                this.physics.add.collider(this.player, this.layers[name]);
            }
        }
        
        //Criar colisão entre a "Maozinha" do Player e os objetos da camada de objetos da camada de Objetos
        // Chama a função this.handleTouch toda vez que o this.touch entrar em contato com um objeto do this.groupObjects
        this.physics.add.overlap(this.touch, this.groupObjects, this.handleTouch, undefined, this);
    }

    handleTouch(touch, object) {
        if(this.isTouching && this.player.isAction){

            return;
        }

        if (this.isTouching && !this.player.isAction){
            this.isTouching = false;
            return;
        }
        // if(this.player.isAction){
        //     this.isTouching = true;
        //     //pegando sementes
        //     if(object.name === 'cenoura' && this.sementeCenoura == false){
        //         this.sementeCenoura = true;
        //         console.log("peguei a semente de cenoura")
        //     }
        //     if(object.name === 'nabo' && this.sementeNabo == false){
        //         this.sementeNabo = true;
        //         console.log("peguei a semente de nabo")
        //     }
        //     if(object.name === 'beringela' && this.sementeNabo == false){
        //         this.sementeBeringela = true;
        //         console.log("peguei a semente de beringela")
        //     }
        //     //plantado a sementes
        //     if(object.name === 'espacocenoura' && this.sementeCenoura == true ){
        //         const pegaPosicao = this.physics.add.sprite(object.x, object.y,'spritGeral')
        //         .setDepth(0)
        //         pegaPosicao.setFrame(585)
        //         this.sementeCenoura = false;
        //         this.cenouraNivel = 2;
        //     }
        //     if(object.name === 'terrenoNabo' && this.sementeNabo == true ){
        //         const pegaPosicao = this.physics.add.sprite(object.x, object.y,'spritGeral')
        //         .setDepth(0)
        //         pegaPosicao.setFrame(609)
        //         this.sementeNabo = false;
        //         this.naboNivel = 2;
        //     }
        //     if(object.name === 'espacoberingela' && this.sementeBeringela == true ){
        //         const pegaPosicao = this.physics.add.sprite(object.x, object.y,'spritGeral')
        //         .setDepth(0)
        //         pegaPosicao.setFrame(657)
        //         this.sementeBeringela = false;
        //         this.beringelaNivel = 2;
        //     }
        //     //regando a determinada planta
        //     if(object.name === 'regador' && this.regador == false) {
        //         this.regador = true;
        //     }
        //     // fases da cenoura
        //     if(object.name === 'espacocenoura' && this.regador == true && this.cenouraNivel == 2) {
        //         setTimeout(() => {
        //             const pegaPosicao = this.physics.add.sprite(object.x, object.y,'spritGeral')
        //             .setDepth(0)
        //             pegaPosicao.setFrame(586)

        //         }, 300);
        //         this.cenouraNivel = 3
        //         this.regador = false;                      
                
        //     }
        //     if(object.name === 'terrenoCenoura' && this.regador == true && this.cenouraNivel == 3) {
        //         console.log("entrei no nivel 3")
        //         setTimeout(() => {
        //             const pegaPosicao = this.physics.add.sprite(object.x, object.y,'spritGeral')
        //             .setDepth(0)
        //             pegaPosicao.setFrame(587)
        //         }, 300);
        //         this.regador = false;
        //     }

        //     //fase do nabo

        //     if(object.name === 'terrenoNabo' && this.regador == true && this.naboNivel == 2) {
        //         setTimeout(() => {
        //             const pegaPosicao = this.physics.add.sprite(object.x, object.y,'spritGeral')
        //             .setDepth(0)
        //             pegaPosicao.setFrame(610)

        //         }, 300);
        //         this.naboNivel = 3
        //         this.regador = false;                      
                
        //     }
        //     if(object.name === 'terrenoNabo' && this.regador == true && this.naboNivel == 3) {
        //         console.log("entrei no nivel 3")
        //         setTimeout(() => {
        //             const pegaPosicao = this.physics.add.sprite(object.x, object.y,'spritGeral')
        //             .setDepth(0)
        //             pegaPosicao.setFrame(611)
        //         }, 300);
        //         this.regador = false;
        //         this.naboNivel = 1;
        //     }

        //     //fase da beringela

        //     if(object.name === 'espacoberingela' && this.regador == true && this.beringelaNivel == 2) {
        //         setTimeout(() => {
        //             const pegaPosicao = this.physics.add.sprite(object.x, object.y,'spritGeral')
        //             .setDepth(0)
        //             pegaPosicao.setFrame(658)

        //         }, 300);
        //         this.beringelaNivel = 3
        //         this.regador = false;                      
                
        //     }
        //     if(object.name === 'espacoberingela' && this.regador == true && this.beringelaNivel == 3) {
        //         console.log("entrei no nivel 3")
        //         setTimeout(() => {
        //             const pegaPosicao = this.physics.add.sprite(object.x, object.y,'spritGeral')
        //             .setDepth(0)
        //             pegaPosicao.setFrame(659)
        //         }, 300);
        //         this.regador = false;
        //         this.beringelaNivel = 1
        //     }
        // }
}

}
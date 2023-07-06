import { Scene } from "phaser";
import { CONFIG } from "../config";
import Player from "../entities/Player";
import Touch from "../entities/Touch";
import Casa from "./Casa"

export default class Fazenda extends Scene {

    /**@type {Phaser.Tilemaps.Tilemap} */
    map;

    layers = {};

    /** @type {Player} */
    player;

    touch;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    vaca;
    vaca2;

    /** @type {Phaser.Physics.Arcade.Group} */
    groupObjects;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    groupObjects;
    
    
    cenouraLevel = 1;
    couveflorLevel = 1;   
    milhoLevel = 1;
    beringeLevel = 1;

    
    plantaCenoura = false;
    plantaMilho = false;
    plantaCouveflor = false;
    plantaBeringela = false;
    

    
    

    regador = false;

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

       this.load.spritesheet('vaca2', 'mapas/tiles/vacas_anim.png', {
        frameWidth: CONFIG.TILE_SIZE * 2,
        frameHeight: CONFIG.TILE_SIZE * 2
        });

       this.load.spritesheet('sprite', 'mapas/tiles/geral.png', {
        frameWidth: CONFIG.TILE_SIZE,
        frameHeight: CONFIG.TILE_SIZE
       });
    }

    create(){
        this.createMap();
        this.createLayers();
        this.createPlayer();
        this.createVaca();
        this.createObjects();
        this.createColliders();
        this.createCamera();
    }

    update(){
        
    }

    createPlayer() {
        this.touch = new Touch(this, 50, 50);
        this.player = new Player(this, 16*12, 16*4, this.touch);
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

    createVaca() {
        this.vaca = this.physics.add.sprite(CONFIG.TILE_SIZE, 18* CONFIG.TILE_SIZE, 'vaca').setOrigin(0,1).setDepth(this.layers.length + 1).setFrame(0);
        this.vaca.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('vaca', {
                start: 0, end: 2 }),
                frameRate: 6,
                repeat: -1
        });
        this.vaca.play('idle')


        this.vaca.anims.create({
            key: 'andando',
            frames: this.anims.generateFrameNumbers('vaca', {
                start: 9, end: 16 }),
                frameRate: 6,
                repeat: -1,
                
        })
        this.vaca.play('andando')
        this.vaca.setVelocityX(7)
        this.vaca.flipX = false;
        
        this.time.addEvent({
            delay: 10, 
            loop: true,
            callback: () => {
                if (this.vaca.body.blocked.right) {
                    this.vaca.setVelocityX(-7);
                    this.vaca.flipX = true;
                } else if (this.vaca.body.blocked.left) {
                    this.vaca.setVelocityX(7);
                    this.vaca.flipX = false; 
                }
            }
        });

        this.vaca2 = this.physics.add.sprite(CONFIG.TILE_SIZE * 10, 22* CONFIG.TILE_SIZE, 'vaca2').setOrigin(0,1).setDepth(this.layers.length + 1).setFrame(0);
        this.vaca2.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('vaca2', {
                start: 176, end: 179 }),
                frameRate: 6,
                repeat: -1
        });
        this.vaca2.play('idle')


        this.vaca2.anims.create({
            key: 'andando',
            frames: this.anims.generateFrameNumbers('vaca2', {
                start: 137, end: 144 }),
                frameRate: 6,
                repeat: -1,
                
        })
        this.vaca2.play('andando')
        this.vaca2.setVelocityX(7)
        this.vaca2.flipX = false;
        
        this.time.addEvent({
            delay: 10, 
            loop: true,
            callback: () => {
                if (this.vaca2.body.blocked.right) {
                    this.vaca2.setVelocityX(-7);
                    this.vaca2.flipX = true;
                } else if (this.vaca2.body.blocked.left) {
                    this.vaca2.setVelocityX(7);
                    this.vaca2.flipX = false; 
                }
            }
        });
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
                this.physics.add.collider(this.vaca, this.layers[name]);
                this.physics.add.collider(this.vaca2, this.layers[name]);
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

        if (this.player.isAction) {
            if (object.name === 'porta') {
            this.scene.switch('Casa')
            }
        }

        if(this.player.isAction){
            this.isTouching = true;
            
            if(object.name === 'couveflor' && this.plantaCouveflor == false){
                this.plantaCouveflor = true;
            }
            if(object.name === 'milho' && this.plantaMilho == false){
                this.plantaMilho = true;
            }
            if(object.name === 'beringela' && this.plantaBeringela == false){
                this.plantaBeringela = true;
            }
            if(object.name === 'cenoura' && this.plantaCenoura == false){
                this.plantaCenoura = true;
            }
            
            if(object.name === 'espacocenoura' && this.plantaCenoura == true ){
                const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                .setDepth(0)
                pegaPosicao.setFrame(585)
                this.plantaCenoura = false;
                this.cenouraLevel = 2;
            }
            if(object.name === 'espacomilho' && this.plantaMilho == true ){
                const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                .setDepth(0)
                pegaPosicao.setFrame(609)
                this.plantaMilho = false;
                this.milhoLevel = 2;
            }
            if(object.name === 'espacoberingela' && this.plantaBeringela == true ){
                const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                .setDepth(0)
                pegaPosicao.setFrame(657)
                this.plantaBeringela = false;
                this.beringeLevel = 2;
            }

            if(object.name === 'espacocouveflor' && this.plantaCouveflor == true ){
                const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                .setDepth(0)
                pegaPosicao.setFrame(657)
                this.plantaCouveflor = false;
                this.couveflorLevel = 2;
            }
            
            if(object.name === 'regador' && this.regador == false) {
                this.regador = true;
            }
            
            if(object.name === 'espacocenoura' && this.regador == true && this.cenouraLevel == 2) {
                setTimeout(() => {
                    const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                    .setDepth(0)
                    pegaPosicao.setFrame(586)

                }, 300);
                this.cenouraLevel = 3
                this.regador = false;                      
                
            }
            if(object.name === 'terrenoCenoura' && this.regador == true && this.cenouraLevel == 3) {
                setTimeout(() => {
                    const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                    .setDepth(0)
                    pegaPosicao.setFrame(587)
                }, 300);
                this.cenouraLevel = 1
                this.regador = false;
            }

            if(object.name === 'espacomilho' && this.regador == true && this.milhoLevel == 2) {
                setTimeout(() => {
                    const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                    .setDepth(0)
                    pegaPosicao.setFrame(610)

                }, 300);
                this.milhoLevel = 3
                this.regador = false;                      
                
            }
            if(object.name === 'espacomilho' && this.regador == true && this.milhoLevel == 3) {
                setTimeout(() => {
                    const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                    .setDepth(0)
                    pegaPosicao.setFrame(611)
                }, 300);
                this.regador = false;
                this.naboNivel = 1;
            }

            if(object.name === 'espacoberingela' && this.regador == true && this.beringeLevel == 2) {
                setTimeout(() => {
                    const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                    .setDepth(0)
                    pegaPosicao.setFrame(658)

                }, 300);
                this.beringeLevel = 3
                this.regador = false;                      
                
            }
            if(object.name === 'espacoberingela' && this.regador == true && this.beringeLevel == 3) {
                setTimeout(() => {
                    const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                    .setDepth(0)
                    pegaPosicao.setFrame(659)
                }, 300);
                this.regador = false;
                this.beringeLevel = 1
            }

            if(object.name === 'espacocouveflor' && this.regador == true && this.couveflorLevel == 2) {
                setTimeout(() => {
                    const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                    .setDepth(0)
                    pegaPosicao.setFrame(658)

                }, 300);
                this.couveflorLevel = 3
                this.regador = false;                      
                
            }
            if(object.name === 'espacocouveflor' && this.regador == true && this.couveflorLevel == 3) {
                setTimeout(() => {
                    const pegaPosicao = this.physics.add.sprite(object.x, object.y,'sprite')
                    .setDepth(0)
                    pegaPosicao.setFrame(659)
                }, 300);
                this.regador = false;
                this.couveflorLevel = 1
            }
        }
}

}
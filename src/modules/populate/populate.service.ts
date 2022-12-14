import { ProductDto } from './../products/dto/product.dto';
import { CategoryDto } from './../categories/dto/category.dto';
import { ProductsService } from './../products/products.service';
import { CategoriesService } from './../categories/categories.service';
import { ConfigService } from '@nestjs/config';
import { UserDto, PermissionDto, RoleDto, UsersService, RolesService, PermissionsService } from 'oteos-backend-lib';
import { Injectable } from "@nestjs/common";

@Injectable()
export class PopulateService {
  constructor(
    private readonly ConfigService: ConfigService,
    private readonly permissionService: PermissionsService,
    private readonly roleService: RolesService,
    private readonly userService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {
    if (this.ConfigService.get("app.populate")) {
      this.populate();
    }
  }

  async populate() {
    await this.populatePermissions();
    await this.populateRoles();
    await this.populateUsers();
    await this.populateCategories();
    await this.populateProducts();
  }

  async populatePermissions() {
    const permissions: string[] = [
      'CREATE',
      'UPDATE',
      'READ',
      'DELETE',
    ];

    for (const p of permissions) {
      const permission = await this.permissionService.fetchPermission(p);
      if (!permission) {
        const newPermission = new PermissionDto(p);
        await this.permissionService.createPermission(newPermission);
      }
    }
  }

  async populateRoles() {
    const roles: RoleDto[] = [
      {
        name: 'SUPERADMIN',
        permissions: [],
      },
      {
        name: 'ADMIN',
        permissions: [
          new PermissionDto('CREATE'),
          new PermissionDto('READ'),
          new PermissionDto('UPDATE'),
          new PermissionDto('DELETE'),
        ],
      },
      {
        name: 'USER',
        permissions: [
          new PermissionDto('CREATE'), 
          new PermissionDto('READ')
        ],
      },
      {
        name: "PUBLIC",
        permissions: []
      }
    ];

    for (const r of roles) {
      const role = await this.roleService.findRole(r.name);
      if (!role) {
        await this.roleService.createRole(r);
      }
    }
  }

  async populateUsers() {
    const users: UserDto[] = [
      {
        userName: 'superadmin',
        password: '123456789Abc!',
        email: 'superadmin@tfg-lorenzo.com',
        role: new RoleDto('SUPERADMIN', [])
      },
      {
        userName: 'admin',
        password: '123456789Abc!',
        email: 'admin@tfg-lorenzo.com',
        role: new RoleDto('ADMIN', [
          new PermissionDto('CREATE'),
          new PermissionDto('READ'),
          new PermissionDto('UPDATE'),
          new PermissionDto('DELETE'),
        ]),
      },
    ];

    for (const u of users) {
      const user = await this.userService.findUser(u.userName);
      if (!user) {
        await this.userService.createUser(u);
      }
    }
  }

  async populateCategories() {
    const categories: string[] = [
      'Pistolas',
      'Rifles',
      'Escopetas',
      'Cuchillos',
      'Equipamiento',
    ];

    for (const c of categories) {
      const category = await this.categoriesService.findCategory(c);
      if (!category) {
        const newCategory: CategoryDto = {
          name: c
        }
        await this.categoriesService.createCategory(newCategory);
      }
    }
  }

  async populateProducts() {
    const products: ProductDto[] = [
      {
        code: '00000-00001',
        category: {name: 'Pistolas'},
        name: 'PISTOLA GLOCK 26 GEN 3',
        description: 'Con la presentaci??n de la GLOCK 26  en agosto de 1985, comenz?? el victorioso camino de la m??s peque??a de las pistolas GLOCK, que fue especialmente desarrollada para ser portada de modo cubierto ??? antes el dominio de los rev??lveres cortos de cinco tiros. ',
        price: 629,
        tax: 21,
        publicSellPrice: 761.09,
        stock: 25,
      },
      {
        code: '00000-00002',
        category: {name: 'Pistolas'},
        name: 'Pistola Glock 26 Gen 5',
        description: 'NUEVA TERMINACI??N "nDLF" EN CORREDERA Y CA????N, MUY FINA Y EXTREMADAMENTE RESISTENTE A LA ABRASI??N RETENIDA DE CORREDERA AMBIDIESTRA TOMA DE CARGADOR DIMENSIONADA EMPU??ADURA LISA CON TERMINACI??N RUGOSA RTF NUEVO CARGADOR CON BASE AMPLIADA Y TEJA ELEVADORA NARANJA FLUOR EVOLUCI??N DEL SISTEMA "SAFE ACTION GLOCK" PARA UNA SALIDA DE DISPARADOR MAS LIMPIA SIN ALTERAR EL FUNCIONAMIENTO DE SUS 3 SEGUIROS AUTOM??TICOS.',
        price: 741,
        tax: 21,
        publicSellPrice: 896.61,
        stock: 25,
      },
      {
        code: '00000-00003',
        category: {name: 'Pistolas'},
        name: 'Pistola Glock 43 X Silver Slide FS',
        description: 'LA NUEVA G43X ES UNA DE LAS ??LTIMAS INCORPORACIONES A LA FAMILIA DE PISTOLAS GLOCK  CON SU CORREDERA SUBCOMPACTA, LA G43X AMPLIA LA FAMILIA DE LA GAMA MODELOS SLIMLINE, AHORA CON CORREDERA COLOR PLATA EN TERMINACI??N PVD, EL MAS RESISTENTE FABRICADO EN EL MERCADO  PARTIENDO DEL DISE??O DE LA SERIE SLIM Y CREANDO UN AJUSTE PERFECTO PARA CUALQUIER TAMA??O DE MANO.',
        price: 684,
        tax: 21,
        publicSellPrice: 827.64,
        stock: 10,
      },
      {
        code: '00000-00004',
        category: {name: 'Pistolas'},
        name: 'Pistola Glock 19 X Coyote',
        description: 'LA PRIMERA PISTOLA "CROSSOVER" DE GLOCK  El nuevo modelo GLOCK 19X combina las mejores caracter??sticas de dos de las plataformas de GLOCK m??s populares, fiables y probadas en todos los terrenos. El armaz??n de tama??o est??ndard de la GLOCK 17 y la corredera compacta de la GLOCK 19 se combinan uniendo su fuerzas para crear un tama??o de arma ideal para todas las condiciones y situaciones posibles.',
        price: 805,
        tax: 21,
        publicSellPrice: 974.05,
        stock: 15,
      },

      {
        code: '00000-00005',
        category: {name: 'Rifles'},
        name: 'RIFLE CARABINA SEMIAUTOM??TICA HI-POINT 995TS',
        description: 'El rifle semiautom??tico Hi-Point modelo 995TS es un rifle de fuego central de fabricaci??n 100% en Estados Unidos.  Es un arma que si tuvi??ramos que definirla en pocas palabras dir??amos que es de f??cil uso, simple, fiable, robusta, divertida y sobre todo econ??mica. Arma ideal para cuerpos de seguridad como para el ocio.',
        price: 699,
        tax: 21,
        publicSellPrice: 845.79,
        stock: 20,
      },
      {
        code: '00000-00006',
        category: {name: 'Rifles'},
        name: 'RIFLE F. LLI PIETTA CHRONOS',
        description: '??? B??SCULA FABRICADA EN ALEACI??N DE ALUMINIO DE ALTA RESISTENCIA (ERGAL) ACABADO EN ANODIZADO NEGRO MATE O NICKEL ??? CA????N FABRICADO EN ACERO SAE4140, AMARTILLADO EN FR??O Y TRATADO TERMICAMENTE SIGUIENDO NORMAS CIP ??? SISTEMA DE RECUPERACI??N DE GAS ??? BANDA CON ALZA AJUSTABLE Y PUNTO DE MIRA DE FIBRA ??? CERROJO GIRATORIO GEOM??TRICO ??? CULATA EN MADERA AJUSTABLE MEDIANTE KITS DE ESPACIADORES INCLUIDOS (50-55-62) ??? CANTONERA DE MICRO GEL EXTRA-SOFT ??? SEGURO MANUAL EN GATILLO, Y AUTOM??TICO EN EL CIERRE DEL OBTURADOR ??? CARGADOR EXTRAIBLE - CAPACIDAD 2 + 1',
        price: 980,
        tax: 21,
        publicSellPrice: 1185.80,
        stock: 20,
      },
      {
        code: '00000-00007',
        category: {name: 'Rifles'},
        name: 'Rifle Bergara B14 HMR Varmint',
        description: 'Varios calibres, .6,5  Creedmoor,(22" o 24") .308 Win.(20" o 24") 22-250 Rem., 300 Win.Mag. Nuestra acci??n B14 es precisa, fiable y dispone del cerrojo m??s fluido y suave de su segmento. El cerrojo es de 2 tetones y la apertura a 90??. La configuraci??n y las dimensiones del recibidor ofrecen unas grandes posibilidades de customizaci??n con una amplia gama de accesorios disponibles en el mercado (ra??les, monturas, disparadores, etc.)',
        price: 1205,
        tax: 21,
        publicSellPrice: 1458.05,
        stock: 5,
      },

      {
        code: '00000-00008',
        category: {name: 'Escopetas'},
        name: 'Escopeta Stoeger 3020',
        description: 'Dise??ada y fabricada para ofrecer un buen rendimiento bal??stico, incluso en las condiciones m??s extremas. La semiautom??tica calibre 20 se ofrece a un nivelde precio incre??ble. Est?? equipada con un mecaismo de inercia que tiene un cabezal rotativo, f??cilmente desmontable. Sus componentes se han sometido a un tratamiento t??rmico y la dureza de un recubrimiento especial.',
        price: 545,
        tax: 21,
        publicSellPrice: 659.45,
        stock: 20,
      },
      {
        code: '00000-00009',
        category: {name: 'Escopetas'},
        name: 'Escopeta Franchi Affinity 20',
        description: 'Calibre: 20/76 Peso: 2,65 Kgr. Choke: ICK 70mm, Caja de cart??n, 3 Pro-choke de 1, 3 y Cyl, kit de regulaci??n culata: 50, 55, 65, aceite, anillas portafusil.',
        price: 919.08,
        tax: 21,
        publicSellPrice: 1112.08,
        stock: 30,
      },
      {
        code: '00000-00010',
        category: {name: 'Escopetas'},
        name: 'Escopeta Fabarm Martial Ultrashort',
        description: 'ESCOPETA COMPACTA MARTIAL ULTRASHORT IDEAL PARA DEFENSA POLICIAL La escopeta MARTIAL tiene una capacidad de 6 cartuchos. Es una escopeta de corredera muy compacta, ligera y vers??til que permite disparar cualquier tipo de cartucho. Perfecta para la auto-defensa y para ser utilizada en sitios con poca movilidad. Ca????n de 36cm. Chokes MULTI (C).',
        price: 712,
        tax: 21,
        publicSellPrice: 861.52,
        stock: 30,
      },
      {
        code: '00000-00011',
        category: {name: 'Escopetas'},
        name: 'Escopeta Ugartechea Modelo 30',
        description: 'SCOPETA UGARTECHEA MODELO 30 Hammerless, sistema Anson & Deeely, con extractor Holland de doble radio. V??lvulas, agujas percutoras intercambiables. Culata inglesa. Calibre 12.  Ca????n 70 cm. Culata: 37 cm.  Calibre: 12/70 Chokes: *** y *. No expulsora.  Escopeta algo marcada por exposici??n.',
        price: 515,
        tax: 21,
        publicSellPrice: 623.15,
        stock: 5,
      },

      {
        code: '00000-00012',
        category: {name: 'Cuchillos'},
        name: 'Cuchillo Glock 78 Black',
        description: 'Cuchillo de combate Glock modelo 78 est?? fabricado con una hoja de acero al carbono de filo liso con guardamanos. Es un cuchillo muy vers??til de dotaci??n de varios ej??rcitos del mundo como el Ej??rcito Austr??aco.   Su gran resistencia y funda de pol??mero lo convierten en un cuchillo que permite realizar cualquier tarea con ??l.',
        price: 40,
        tax: 21,
        publicSellPrice: 48.4,
        stock: 10,
      },
      {
        code: '00000-00013',
        category: {name: 'Cuchillos'},
        name: 'Cuchillo Glock 81 verde',
        description: 'Cuchillo de combate Glock modelo 81 est?? fabricado con una hoja de acero al carbono de filo liso y con sierra en el lomo. Es un cuchillo muy vers??til de dotaci??n de varios ej??rcitos del mundo como el Ej??rcito Austr??aco.   Su gran resistencia y funda de pol??mero lo convierten en un cuchillo que permite realizar cualquier tarea con ??l.',
        price: 45,
        tax: 21,
        publicSellPrice: 54.45,
        stock: 39,
      },
      {
        code: '00000-00014',
        category: {name: 'Cuchillos'},
        name: 'Cuchillo Morakniv Companion',
        description: '- Material de la hoja: acero inoxidable Sandvik 12C27 - Longitud de la hoja: 10,3 cm - Grosor de la hoja: 2,5 mm - Longitud total: 21,8 cm - Material del mango: goma sint??tica con tacto especial antideslizante - Peso del cuchillo: 85 g. - Peso con funda incluida: 116 g. - Funda de pol??mero en color naranja, con sistema de cierre a presi??n y clip en su parte trasera para acoplarla al cintur??n.',
        price: 15.9,
        tax: 21,
        publicSellPrice: 19.23,
        stock: 29,
      },
      {
        code: '00000-00015',
        category: {name: 'Cuchillos'},
        name: 'Cuchillo Muela Sioux 10R',
        description: 'Cuchillo de la prestigiosa casa Muela de fabricaci??n espa??ola. Sus cachas son de madera prensada de coral de 110 mm (4 3 /8").  Hoja de acero inoxidable enteriza de composici??n X50CrMoV15.',
        price: 60,
        tax: 21,
        publicSellPrice: 72.6,
        stock: 0,
      },
    ];

    for (const p of products) {
      const product = await this.productsService.findProduct(p.code);
      if (!product) {
        await this.productsService.createproduct(p);
      }
    }
  }
}

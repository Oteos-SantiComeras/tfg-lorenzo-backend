import { CategoryDto } from './../categories/dto/category.dto';
import { CartDto } from './../cart/dto/cart.dto';
import { CartService } from './../cart/cart.service';
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
    private readonly cartsService: CartService,
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
    //await this.populateCarts();
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

  async populateCarts() {
    const carts: CartDto[] = [
      {
        user: {
          userName: 'superadmin',
          password: '123456789Abc!',
          email: 'superadmin@tfg-lorenzo.com',
          role: new RoleDto('SUPERADMIN', [])
        },
      },
      {
        user: {
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
      },
    ];

    for (const c of carts) {
      const cart = await this.cartsService.findCart(c.user.userName);
      if (!cart) {
        await this.cartsService.createCart(c);
      }
    }
  }
}

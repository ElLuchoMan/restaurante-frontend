Archivo | Cambio | Fuente | Comentario
--- | --- | --- | ---
`src/app/shared/constants.ts` | Añadidos enums `DiaSemana`, `EstadoPedido`, `RolTrabajador` según Swagger; fijado `detalle` | `context/swagger.json` | Reemplaza `Roles`; typo `detallle` → `detalle`
`src/app/shared/models/reserva.model.ts` | Creado `ReservaBase`/`ReservaPopulada`; requests usan `ReservaBase` | Swagger `models.Reserva*` | `createdBy` opcional permitido en create
`src/app/shared/models/pedido.model.ts` | `estadoPedido: EstadoPedido` | Swagger `models.EstadoPedido` | Antes era `string`
`src/app/shared/models/horario-trabajador.model.ts` | Agrega `horarioTrabajadorId`; `dia: DiaSemana`; HH:MM:SS | Swagger `models.HorarioTrabajador` |
`src/app/shared/models/producto-pedido.model.ts` | Renombra `detallesProductos` → `detalles` | Swagger `ProductoPedido*` |
`src/app/shared/models/trabajador.model.ts` | `rol: RolTrabajador` | Swagger `models.RolTrabajador` |
`src/app/shared/models/restaurante.model.ts` | `diasLaborales: DiaSemana[]` | Swagger `models.DiaSemana` |
`src/app/modules/auth/register/register.component.ts` | Uso de `RolTrabajador` | Swagger | Cast seguro con fallback
`src/app/core/services/reserva.service.ts` | Tipos a `ReservaPopulada`; preserva `contactoId` cuando aplique | Swagger + Datos.sql |
`src/app/shared/mocks/reserva.mocks.ts` | Requests sin PII; normaliza HH:MM:SS/fechas; IDs válidos | `Datos.sql` | Usa `contactoId`/`restauranteId` existentes
`src/app/shared/mocks/producto-pedido.mock.ts` | `detalles` y `pedidoId` válido | Swagger + `Datos.sql` |
`src/app/shared/mocks/error.mock.ts` | Agregados errores 400/404 por recurso (ApiResponse) | Swagger `ApiResponse` |
`src/app/shared/models/cliente.model.ts` | Añade `ClienteListParams` y `ClienteSlim` | Requisito tarea |
`src/app/shared/mocks/cliente.mock.ts` | Mocks de paginación y proyección (`fields`) | Requisito tarea |
`src/app/shared/mocks/mocks.spec.ts` | Ajustes asserts a cambios | — |
`src/app/modules/public/reservas/*` | Ajustes a `ReservaPopulada` y horas HH:MM:SS | — |

Notas:
- Enums sincronizados literalmente: `DiaSemana`, `EstadoPedido`, `RolTrabajador`.
- `ProductoPedidoResponse` usa `detalles` (no `detallesProductos`).
- Reservas: requests sin `documentoCliente/nombreCompleto/telefono`.

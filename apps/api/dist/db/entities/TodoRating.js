"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoRating = void 0;
const typeorm_1 = require("typeorm");
let TodoRating = class TodoRating {
    id;
    userId;
    todoId;
    value;
    createdAt;
};
exports.TodoRating = TodoRating;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], TodoRating.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], TodoRating.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], TodoRating.prototype, "todoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint" }),
    __metadata("design:type", Number)
], TodoRating.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamptz" }),
    __metadata("design:type", Date)
], TodoRating.prototype, "createdAt", void 0);
exports.TodoRating = TodoRating = __decorate([
    (0, typeorm_1.Entity)("todo_ratings"),
    (0, typeorm_1.Unique)(["userId", "todoId"])
], TodoRating);

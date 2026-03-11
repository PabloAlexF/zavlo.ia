var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';
let CreateProductDto = (() => {
    var _a;
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _images_decorators;
    let _images_initializers = [];
    let _images_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _source_decorators;
    let _source_initializers = [];
    let _source_extraInitializers = [];
    let _sourceUrl_decorators;
    let _sourceUrl_initializers = [];
    let _sourceUrl_extraInitializers = [];
    let _state_decorators;
    let _state_initializers = [];
    let _state_extraInitializers = [];
    let _city_decorators;
    let _city_initializers = [];
    let _city_extraInitializers = [];
    let _cep_decorators;
    let _cep_initializers = [];
    let _cep_extraInitializers = [];
    let _sellerName_decorators;
    let _sellerName_initializers = [];
    let _sellerName_extraInitializers = [];
    let _sellerPhone_decorators;
    let _sellerPhone_initializers = [];
    let _sellerPhone_extraInitializers = [];
    let _condition_decorators;
    let _condition_initializers = [];
    let _condition_extraInitializers = [];
    return _a = class CreateProductDto {
            constructor() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.price = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.images = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _images_initializers, void 0));
                this.category = (__runInitializers(this, _images_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.source = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _source_initializers, void 0));
                this.sourceUrl = (__runInitializers(this, _source_extraInitializers), __runInitializers(this, _sourceUrl_initializers, void 0));
                this.state = (__runInitializers(this, _sourceUrl_extraInitializers), __runInitializers(this, _state_initializers, void 0));
                this.city = (__runInitializers(this, _state_extraInitializers), __runInitializers(this, _city_initializers, void 0));
                this.cep = (__runInitializers(this, _city_extraInitializers), __runInitializers(this, _cep_initializers, void 0));
                this.sellerName = (__runInitializers(this, _cep_extraInitializers), __runInitializers(this, _sellerName_initializers, void 0));
                this.sellerPhone = (__runInitializers(this, _sellerName_extraInitializers), __runInitializers(this, _sellerPhone_initializers, void 0));
                this.condition = (__runInitializers(this, _sellerPhone_extraInitializers), __runInitializers(this, _condition_initializers, void 0));
                __runInitializers(this, _condition_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [IsString()];
            _description_decorators = [IsString()];
            _price_decorators = [IsNumber()];
            _images_decorators = [IsArray()];
            _category_decorators = [IsString()];
            _source_decorators = [IsString()];
            _sourceUrl_decorators = [IsString()];
            _state_decorators = [IsString()];
            _city_decorators = [IsString()];
            _cep_decorators = [IsOptional(), IsString()];
            _sellerName_decorators = [IsString()];
            _sellerPhone_decorators = [IsOptional(), IsString()];
            _condition_decorators = [IsOptional(), IsEnum(['new', 'used'])];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _images_decorators, { kind: "field", name: "images", static: false, private: false, access: { has: obj => "images" in obj, get: obj => obj.images, set: (obj, value) => { obj.images = value; } }, metadata: _metadata }, _images_initializers, _images_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _source_decorators, { kind: "field", name: "source", static: false, private: false, access: { has: obj => "source" in obj, get: obj => obj.source, set: (obj, value) => { obj.source = value; } }, metadata: _metadata }, _source_initializers, _source_extraInitializers);
            __esDecorate(null, null, _sourceUrl_decorators, { kind: "field", name: "sourceUrl", static: false, private: false, access: { has: obj => "sourceUrl" in obj, get: obj => obj.sourceUrl, set: (obj, value) => { obj.sourceUrl = value; } }, metadata: _metadata }, _sourceUrl_initializers, _sourceUrl_extraInitializers);
            __esDecorate(null, null, _state_decorators, { kind: "field", name: "state", static: false, private: false, access: { has: obj => "state" in obj, get: obj => obj.state, set: (obj, value) => { obj.state = value; } }, metadata: _metadata }, _state_initializers, _state_extraInitializers);
            __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: obj => "city" in obj, get: obj => obj.city, set: (obj, value) => { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
            __esDecorate(null, null, _cep_decorators, { kind: "field", name: "cep", static: false, private: false, access: { has: obj => "cep" in obj, get: obj => obj.cep, set: (obj, value) => { obj.cep = value; } }, metadata: _metadata }, _cep_initializers, _cep_extraInitializers);
            __esDecorate(null, null, _sellerName_decorators, { kind: "field", name: "sellerName", static: false, private: false, access: { has: obj => "sellerName" in obj, get: obj => obj.sellerName, set: (obj, value) => { obj.sellerName = value; } }, metadata: _metadata }, _sellerName_initializers, _sellerName_extraInitializers);
            __esDecorate(null, null, _sellerPhone_decorators, { kind: "field", name: "sellerPhone", static: false, private: false, access: { has: obj => "sellerPhone" in obj, get: obj => obj.sellerPhone, set: (obj, value) => { obj.sellerPhone = value; } }, metadata: _metadata }, _sellerPhone_initializers, _sellerPhone_extraInitializers);
            __esDecorate(null, null, _condition_decorators, { kind: "field", name: "condition", static: false, private: false, access: { has: obj => "condition" in obj, get: obj => obj.condition, set: (obj, value) => { obj.condition = value; } }, metadata: _metadata }, _condition_initializers, _condition_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreateProductDto };
let FilterProductsDto = (() => {
    var _a;
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _state_decorators;
    let _state_initializers = [];
    let _state_extraInitializers = [];
    let _city_decorators;
    let _city_initializers = [];
    let _city_extraInitializers = [];
    let _minPrice_decorators;
    let _minPrice_initializers = [];
    let _minPrice_extraInitializers = [];
    let _maxPrice_decorators;
    let _maxPrice_initializers = [];
    let _maxPrice_extraInitializers = [];
    let _condition_decorators;
    let _condition_initializers = [];
    let _condition_extraInitializers = [];
    let _source_decorators;
    let _source_initializers = [];
    let _source_extraInitializers = [];
    let _search_decorators;
    let _search_initializers = [];
    let _search_extraInitializers = [];
    return _a = class FilterProductsDto {
            constructor() {
                this.category = __runInitializers(this, _category_initializers, void 0);
                this.state = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _state_initializers, void 0));
                this.city = (__runInitializers(this, _state_extraInitializers), __runInitializers(this, _city_initializers, void 0));
                this.minPrice = (__runInitializers(this, _city_extraInitializers), __runInitializers(this, _minPrice_initializers, void 0));
                this.maxPrice = (__runInitializers(this, _minPrice_extraInitializers), __runInitializers(this, _maxPrice_initializers, void 0));
                this.condition = (__runInitializers(this, _maxPrice_extraInitializers), __runInitializers(this, _condition_initializers, void 0));
                this.source = (__runInitializers(this, _condition_extraInitializers), __runInitializers(this, _source_initializers, void 0));
                this.search = (__runInitializers(this, _source_extraInitializers), __runInitializers(this, _search_initializers, void 0));
                __runInitializers(this, _search_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _category_decorators = [IsOptional(), IsString()];
            _state_decorators = [IsOptional(), IsString()];
            _city_decorators = [IsOptional(), IsString()];
            _minPrice_decorators = [IsOptional(), IsNumber()];
            _maxPrice_decorators = [IsOptional(), IsNumber()];
            _condition_decorators = [IsOptional(), IsString()];
            _source_decorators = [IsOptional(), IsString()];
            _search_decorators = [IsOptional(), IsString()];
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _state_decorators, { kind: "field", name: "state", static: false, private: false, access: { has: obj => "state" in obj, get: obj => obj.state, set: (obj, value) => { obj.state = value; } }, metadata: _metadata }, _state_initializers, _state_extraInitializers);
            __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: obj => "city" in obj, get: obj => obj.city, set: (obj, value) => { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
            __esDecorate(null, null, _minPrice_decorators, { kind: "field", name: "minPrice", static: false, private: false, access: { has: obj => "minPrice" in obj, get: obj => obj.minPrice, set: (obj, value) => { obj.minPrice = value; } }, metadata: _metadata }, _minPrice_initializers, _minPrice_extraInitializers);
            __esDecorate(null, null, _maxPrice_decorators, { kind: "field", name: "maxPrice", static: false, private: false, access: { has: obj => "maxPrice" in obj, get: obj => obj.maxPrice, set: (obj, value) => { obj.maxPrice = value; } }, metadata: _metadata }, _maxPrice_initializers, _maxPrice_extraInitializers);
            __esDecorate(null, null, _condition_decorators, { kind: "field", name: "condition", static: false, private: false, access: { has: obj => "condition" in obj, get: obj => obj.condition, set: (obj, value) => { obj.condition = value; } }, metadata: _metadata }, _condition_initializers, _condition_extraInitializers);
            __esDecorate(null, null, _source_decorators, { kind: "field", name: "source", static: false, private: false, access: { has: obj => "source" in obj, get: obj => obj.source, set: (obj, value) => { obj.source = value; } }, metadata: _metadata }, _source_initializers, _source_extraInitializers);
            __esDecorate(null, null, _search_decorators, { kind: "field", name: "search", static: false, private: false, access: { has: obj => "search" in obj, get: obj => obj.search, set: (obj, value) => { obj.search = value; } }, metadata: _metadata }, _search_initializers, _search_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { FilterProductsDto };

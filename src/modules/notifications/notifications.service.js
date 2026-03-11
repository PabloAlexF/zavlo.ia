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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable } from '@nestjs/common';
let NotificationsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationsService = _classThis = class {
        constructor(configService, firebaseService) {
            this.configService = configService;
            this.firebaseService = firebaseService;
        }
        async sendPushNotification(notification) {
            try {
                const firestore = this.firebaseService.getFirestore();
                // Salvar notificação no banco
                await firestore.collection('notifications').add({
                    userId: notification.userId,
                    title: notification.title,
                    body: notification.body,
                    data: notification.data || {},
                    read: false,
                    createdAt: new Date(),
                });
                // TODO: Integrar com Expo Push Notifications ou FCM
                console.log('Notificação enviada:', notification);
                return { success: true };
            }
            catch (error) {
                console.error('Erro ao enviar notificação:', error);
                return { success: false, error: error.message };
            }
        }
        async getUserNotifications(userId, limit = 20) {
            const firestore = this.firebaseService.getFirestore();
            const snapshot = await firestore
                .collection('notifications')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        async markAsRead(notificationId) {
            const firestore = this.firebaseService.getFirestore();
            await firestore.collection('notifications').doc(notificationId).update({
                read: true,
                readAt: new Date(),
            });
        }
        async notifyNewProduct(userId, productTitle, productId) {
            return this.sendPushNotification({
                userId,
                title: 'Novo produto encontrado!',
                body: `${productTitle} está disponível`,
                data: { productId, type: 'new_product' },
            });
        }
        /**
         * Notifica usuário sobre queda de preço
         */
        async notifyPriceDrop(userId, productTitle, productUrl, oldPrice, newPrice, priceDropPercent) {
            const priceDrop = oldPrice - newPrice;
            return this.sendPushNotification({
                userId,
                title: '💰 Alerta de Preço!',
                body: `${productTitle} caiu de R$ ${oldPrice.toFixed(2)} para R$ ${newPrice.toFixed(2)} (-${priceDropPercent.toFixed(0)}%)`,
                data: {
                    productUrl,
                    oldPrice,
                    newPrice,
                    priceDropPercent,
                    type: 'price_drop'
                },
            });
        }
    };
    __setFunctionName(_classThis, "NotificationsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationsService = _classThis;
})();
export { NotificationsService };

(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/features/ProductCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductCard",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// Mapeamento de nomes amigáveis dos marketplaces
function getSourceName(source) {
    const sourceMap = {
        'amazon.com.br': 'Amazon',
        'kabum.com.br': 'Kabum',
        'olx.com.br': 'OLX',
        'enjoei.com.br': 'Enjoei',
        'mercadolivre.com.br': 'Mercado Livre',
        'magazineluiza.com.br': 'Magazine Luiza'
    };
    return sourceMap[source] || source;
}
// Cores por marketplace
function getSourceColor(source) {
    const colorMap = {
        'amazon.com.br': 'from-orange-400 to-yellow-500',
        'kabum.com.br': 'from-orange-600 to-orange-700',
        'olx.com.br': 'from-purple-500 to-purple-600',
        'enjoei.com.br': 'from-pink-500 to-rose-500',
        'mercadolivre.com.br': 'from-yellow-400 to-yellow-500',
        'magazineluiza.com.br': 'from-blue-400 to-blue-500'
    };
    return colorMap[source] || 'from-blue-500 to-purple-500';
}
function ProductCard({ product }) {
    _s();
    const [currentImageIndex, setCurrentImageIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [imageError, setImageError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [imageRetries, setImageRetries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isFavorite, setIsFavorite] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Normalizar images para sempre ser array
    const images = product.images || [];
    const hasImage = images.length > 0;
    const hasMultipleImages = images.length > 1;
    const location = typeof product.location === 'string' ? product.location : `${product.location?.city || ''}, ${product.location?.state || ''}`;
    const currentImageUrl = hasImage ? images[currentImageIndex] : null;
    const nextImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProductCard.useCallback[nextImage]": (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setCurrentImageIndex({
                "ProductCard.useCallback[nextImage]": (prev)=>(prev + 1) % images.length
            }["ProductCard.useCallback[nextImage]"]);
            setImageError(false);
            setIsLoading(true);
        }
    }["ProductCard.useCallback[nextImage]"], [
        images.length
    ]);
    const prevImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProductCard.useCallback[prevImage]": (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setCurrentImageIndex({
                "ProductCard.useCallback[prevImage]": (prev)=>(prev - 1 + images.length) % images.length
            }["ProductCard.useCallback[prevImage]"]);
            setImageError(false);
            setIsLoading(true);
        }
    }["ProductCard.useCallback[prevImage]"], [
        images.length
    ]);
    const handleImageError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProductCard.useCallback[handleImageError]": ()=>{
            if (imageRetries < 1 && images.length > 1 && currentImageIndex < images.length - 1) {
                setImageRetries(imageRetries + 1);
                setCurrentImageIndex({
                    "ProductCard.useCallback[handleImageError]": (prev)=>(prev + 1) % images.length
                }["ProductCard.useCallback[handleImageError]"]);
                setImageError(false);
                setIsLoading(true);
            } else {
                setImageError(true);
                setIsLoading(false);
            }
        }
    }["ProductCard.useCallback[handleImageError]"], [
        currentImageIndex,
        imageRetries,
        images.length
    ]);
    const handleImageLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProductCard.useCallback[handleImageLoad]": ()=>{
            setIsLoading(false);
            setImageRetries(0);
        }
    }["ProductCard.useCallback[handleImageLoad]"], []);
    const toggleFavorite = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProductCard.useCallback[toggleFavorite]": async (e)=>{
            e.preventDefault();
            e.stopPropagation();
            const user = localStorage.getItem('zavlo_user');
            if (!user) {
                window.location.href = '/auth';
                return;
            }
            try {
                const userData = JSON.parse(user);
                if (!isFavorite) {
                    const API_URL = ("TURBOPACK compile-time value", "https://zavlo-ia.onrender.com/api/v1");
                    const response = await fetch(`${API_URL}/favorites`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userData.token}`
                        },
                        body: JSON.stringify({
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            image: images[0] || '',
                            url: product.sourceUrl,
                            source: product.source
                        })
                    });
                    if (response.ok) {
                        setIsFavorite(true);
                        // Mostrar toast de sucesso
                        const toast = document.createElement('div');
                        toast.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in';
                        toast.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Salvo nos favoritos!</span>
          `;
                        document.body.appendChild(toast);
                        setTimeout({
                            "ProductCard.useCallback[toggleFavorite]": ()=>{
                                toast.style.opacity = '0';
                                toast.style.transform = 'translateX(100%)';
                                setTimeout({
                                    "ProductCard.useCallback[toggleFavorite]": ()=>toast.remove()
                                }["ProductCard.useCallback[toggleFavorite]"], 300);
                            }
                        }["ProductCard.useCallback[toggleFavorite]"], 2000);
                    }
                }
            } catch (error) {
                console.error('Erro ao favoritar:', error);
            }
        }
    }["ProductCard.useCallback[toggleFavorite]"], [
        isFavorite,
        product,
        images
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: `/product/${product.id}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-full bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden mb-4 shadow-lg border border-white/10",
                    style: {
                        height: '280px'
                    },
                    children: hasImage && !imageError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 bg-white/10 animate-pulse z-10"
                            }, void 0, false, {
                                fileName: "[project]/components/features/ProductCard.tsx",
                                lineNumber: 150,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: currentImageUrl || '',
                                alt: product.title,
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                    opacity: isLoading ? 0.5 : 1,
                                    transition: 'opacity 0.2s'
                                },
                                onError: handleImageError,
                                onLoad: handleImageLoad,
                                loading: "lazy"
                            }, void 0, false, {
                                fileName: "[project]/components/features/ProductCard.tsx",
                                lineNumber: 154,
                                columnNumber: 15
                            }, this),
                            hasMultipleImages && !isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: prevImage,
                                        "aria-label": "Imagem anterior",
                                        style: {
                                            position: 'absolute',
                                            left: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 20
                                        },
                                        className: "w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 active:scale-90",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-5 h-5 text-white",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M15 19l-7-7 7-7"
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/ProductCard.tsx",
                                                lineNumber: 186,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/features/ProductCard.tsx",
                                            lineNumber: 185,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/ProductCard.tsx",
                                        lineNumber: 173,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: nextImage,
                                        "aria-label": "Próxima imagem",
                                        style: {
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 20
                                        },
                                        className: "w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 active:scale-90",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-5 h-5 text-white",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M9 5l7 7-7 7"
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/ProductCard.tsx",
                                                lineNumber: 203,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/features/ProductCard.tsx",
                                            lineNumber: 202,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/ProductCard.tsx",
                                        lineNumber: 190,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: 'absolute',
                                            bottom: '12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            zIndex: 20
                                        },
                                        className: "flex gap-1.5",
                                        children: images.map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `h-1.5 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`
                                            }, index, false, {
                                                fileName: "[project]/components/features/ProductCard.tsx",
                                                lineNumber: 219,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/ProductCard.tsx",
                                        lineNumber: 208,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    zIndex: 20
                                },
                                className: `px-3 py-1 bg-gradient-to-r ${getSourceColor(product.source)} rounded-full text-xs font-semibold text-white whitespace-nowrap shadow-lg`,
                                children: getSourceName(product.source)
                            }, void 0, false, {
                                fileName: "[project]/components/features/ProductCard.tsx",
                                lineNumber: 231,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleFavorite,
                                style: {
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    zIndex: 20
                                },
                                className: `w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${isFavorite ? 'bg-red-500/90 scale-110' : 'bg-black/40 hover:bg-black/60'}`,
                                "aria-label": "Favoritar",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                    className: `w-5 h-5 transition-all ${isFavorite ? 'fill-white text-white' : 'text-white'}`
                                }, void 0, false, {
                                    fileName: "[project]/components/features/ProductCard.tsx",
                                    lineNumber: 259,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/features/ProductCard.tsx",
                                lineNumber: 244,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center justify-center h-full gap-2 bg-white/5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-16 h-16 text-gray-600",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 1,
                                    d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                }, void 0, false, {
                                    fileName: "[project]/components/features/ProductCard.tsx",
                                    lineNumber: 269,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/features/ProductCard.tsx",
                                lineNumber: 268,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-gray-500",
                                children: "Imagem indisponível"
                            }, void 0, false, {
                                fileName: "[project]/components/features/ProductCard.tsx",
                                lineNumber: 271,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/ProductCard.tsx",
                        lineNumber: 267,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/features/ProductCard.tsx",
                    lineNumber: 145,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-3 space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "font-medium text-white line-clamp-2 group-hover:text-purple-300 transition-colors text-sm sm:text-base",
                            children: product.title
                        }, void 0, false, {
                            fileName: "[project]/components/features/ProductCard.tsx",
                            lineNumber: 277,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent",
                                    children: [
                                        "R$ ",
                                        product.price.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/features/ProductCard.tsx",
                                    lineNumber: 282,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-gray-500 text-right max-w-[100px] truncate",
                                    children: location
                                }, void 0, false, {
                                    fileName: "[project]/components/features/ProductCard.tsx",
                                    lineNumber: 285,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/features/ProductCard.tsx",
                            lineNumber: 281,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: (e)=>{
                                e.preventDefault();
                                window.open(product.sourceUrl, '_blank');
                            },
                            className: "w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/20",
                            children: [
                                "Ver Produto",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/features/ProductCard.tsx",
                                    lineNumber: 299,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/features/ProductCard.tsx",
                            lineNumber: 291,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/features/ProductCard.tsx",
                    lineNumber: 276,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/features/ProductCard.tsx",
            lineNumber: 144,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/features/ProductCard.tsx",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
_s(ProductCard, "f6gkkwDM/x5H8e2W8V0La2tiGFM=");
_c = ProductCard;
var _c;
__turbopack_context__.k.register(_c, "ProductCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/intentDetector.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Detector de intenção do usuário
__turbopack_context__.s([
    "detectIntent",
    ()=>detectIntent,
    "detectUserIntent",
    ()=>detectUserIntent
]);
// Patterns de intenção
const INTENT_PATTERNS = {
    greeting: /\b(oi|ola|olá|bom dia|boa tarde|boa noite|hey|hello|opa|e ai|eai)\b/i,
    despedida: /\b(tchau|adeus|até logo|até mais|falou|flw|bye|até)\b/i,
    help: /\b(ajuda|help|socorro|como usar|como funciona|tutorial|comandos)\b/i,
    credits_question: /\b(meus? créditos?|saldo|quanto tenho|creditos|quantos creditos)\b/i,
    plans_question: /\b(planos?|assinaturas?|preços?|valores?|quanto custa|pacotes?)\b/i,
    platform_question: /\b(o que é|quem é|sobre|zavlo|plataforma|site|app)\b/i,
    buy: /\b(quero|procuro|busco|preciso|comprar|comprando)\b/i,
    sell: /\b(vendo|vendendo|vender|anuncio)\b/i,
    question: /\b(como|quando|onde|porque|qual|quanto|que)\b/i
};
// Extrai preço da query
const PRICE_PATTERNS = [
    /(ate|até|menos de|max|maximo|máximo)?\s*r?\$?\s*(\d+(?:\.\d+)?k?)/i,
    /(\d+(?:\.\d+)?k?)\s*(reais?|real|r\$)/i
];
const detectIntent = detectUserIntent;
function detectUserIntent(query) {
    const normalized = query.toLowerCase().trim();
    // Detecta comandos específicos PRIMEIRO (ordem importa!)
    if (INTENT_PATTERNS.help.test(normalized)) {
        return {
            type: 'help',
            confidence: 0.95
        };
    }
    if (INTENT_PATTERNS.credits_question.test(normalized)) {
        return {
            type: 'credits_question',
            confidence: 0.95
        };
    }
    if (INTENT_PATTERNS.plans_question.test(normalized)) {
        return {
            type: 'plans_question',
            confidence: 0.95
        };
    }
    if (INTENT_PATTERNS.platform_question.test(normalized)) {
        return {
            type: 'platform_question',
            confidence: 0.95
        };
    }
    if (INTENT_PATTERNS.greeting.test(normalized)) {
        return {
            type: 'greeting',
            confidence: 0.9
        };
    }
    if (INTENT_PATTERNS.despedida.test(normalized)) {
        return {
            type: 'despedida',
            confidence: 0.9
        };
    }
    // Detecta intenção de compra/venda
    if (INTENT_PATTERNS.buy.test(normalized)) {
        return {
            type: 'buy',
            confidence: 0.8,
            extractedPrice: extractPrice(query)
        };
    }
    if (INTENT_PATTERNS.sell.test(normalized)) {
        return {
            type: 'sell',
            confidence: 0.8
        };
    }
    if (INTENT_PATTERNS.question.test(normalized)) {
        return {
            type: 'question',
            confidence: 0.7
        };
    }
    // Default: busca
    return {
        type: 'search',
        confidence: 0.6,
        extractedPrice: extractPrice(query)
    };
}
function extractPrice(query) {
    for (const pattern of PRICE_PATTERNS){
        const match = query.match(pattern);
        if (match) {
            const priceStr = match[2] || match[1];
            let price = parseFloat(priceStr.replace(/[^\d.]/g, ''));
            // Converte 'k' para milhares
            if (priceStr.toLowerCase().includes('k')) {
                price *= 1000;
            }
            return price;
        }
    }
    return undefined;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/contextChangeDetector.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Detecta mudanças de contexto e extrai informações da conversa completa
__turbopack_context__.s([
    "detectContextChange",
    ()=>detectContextChange
]);
// Palavras que indicam correção/mudança
const CORRECTION_PATTERNS = [
    /\b(na verdade|não|nao|melhor|prefiro|quero|ao invés|em vez|invés|vez)\b/i,
    /\b(mudei de ideia|mudei|esquece|deixa|cancela)\b/i,
    /\b(errei|erro|desculpa|ops)\b/i
];
// Palavras que indicam refinamento (não mudança completa)
const REFINEMENT_PATTERNS = [
    /\b(também|e|mais|além|junto|com)\b/i,
    /\b(específico|especifico|detalhe|característica|caracteristica)\b/i
];
function detectContextChange(currentMessage, conversationHistory) {
    const normalized = currentMessage.toLowerCase().trim();
    // Verifica se é uma correção
    const isCorrection = CORRECTION_PATTERNS.some((pattern)=>pattern.test(normalized));
    if (isCorrection) {
        // Extrai o novo produto da mensagem
        const extracted = extractProductFromCorrection(currentMessage);
        return {
            hasChange: true,
            type: 'correction',
            newProduct: extracted.product,
            newBrand: extracted.brand,
            newCondition: extracted.condition,
            newLocation: extracted.location,
            confidence: 0.9
        };
    }
    // Verifica se é refinamento
    const isRefinement = REFINEMENT_PATTERNS.some((pattern)=>pattern.test(normalized));
    if (isRefinement) {
        return {
            hasChange: false,
            type: 'refinement',
            confidence: 0.7
        };
    }
    // Verifica se é uma nova busca (sem relação com anterior)
    if (conversationHistory.length > 0) {
        const lastMessage = conversationHistory[conversationHistory.length - 1];
        const similarity = calculateSimilarity(normalized, lastMessage.toLowerCase());
        if (similarity < 0.3) {
            const extracted = extractProductFromCorrection(currentMessage);
            return {
                hasChange: true,
                type: 'new_search',
                newProduct: extracted.product,
                newBrand: extracted.brand,
                newCondition: extracted.condition,
                newLocation: extracted.location,
                confidence: 0.8
            };
        }
    }
    return {
        hasChange: false,
        type: 'none',
        confidence: 0.5
    };
}
// Extrai produto de uma frase de correção
function extractProductFromCorrection(message) {
    const normalized = message.toLowerCase();
    // Remove palavras de correção para focar no produto
    let cleaned = normalized.replace(/\b(na verdade|não|nao|melhor|prefiro|quero|ao invés|em vez|invés|vez)\b/gi, '').replace(/\b(mudei de ideia|mudei|esquece|deixa|cancela)\b/gi, '').replace(/\b(comprar|buscar|procurar|encontrar|ver)\b/gi, '').replace(/\b(um|uma|uns|umas|o|a|os|as)\b/gi, '').trim();
    // Extrai condição
    let condition;
    if (/\b(novo|nova)\b/i.test(cleaned)) {
        condition = 'novo';
        cleaned = cleaned.replace(/\b(novo|nova)\b/gi, '').trim();
    } else if (/\b(usado|usada|seminovo|seminova)\b/i.test(cleaned)) {
        condition = 'usado';
        cleaned = cleaned.replace(/\b(usado|usada|seminovo|seminova)\b/gi, '').trim();
    }
    // Extrai localização
    let location;
    const locationMatch = cleaned.match(/\b(em|na|no|de)\s+([a-záàâãéèêíïóôõöúçñ\s]+)/i);
    if (locationMatch) {
        location = locationMatch[2].trim();
        cleaned = cleaned.replace(locationMatch[0], '').trim();
    }
    // Extrai marca conhecida
    const brands = [
        'samsung',
        'apple',
        'lg',
        'sony',
        'dell',
        'hp',
        'lenovo',
        'asus',
        'brastemp',
        'consul',
        'electrolux',
        'philco',
        'midea',
        'panasonic',
        'nike',
        'adidas',
        'puma',
        'fila',
        'olympikus',
        'ford',
        'chevrolet',
        'volkswagen',
        'fiat',
        'honda',
        'toyota'
    ];
    let brand;
    for (const b of brands){
        if (cleaned.includes(b)) {
            brand = b;
            cleaned = cleaned.replace(b, '').trim();
            break;
        }
    }
    // O que sobrou é o produto
    const product = cleaned.trim() || undefined;
    return {
        product,
        brand,
        condition,
        location
    };
}
// Calcula similaridade entre duas strings (0-1)
function calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([
        ...words1
    ].filter((x)=>words2.has(x)));
    const union = new Set([
        ...words1,
        ...words2
    ]);
    return intersection.size / union.size;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/contextManager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "contextManager",
    ()=>contextManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextChangeDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/contextChangeDetector.ts [app-client] (ecmascript)");
;
class ContextManager {
    context = {
        conversationHistory: []
    };
    update(data) {
        this.context = {
            ...this.context,
            ...data
        };
    }
    get() {
        return {
            ...this.context
        };
    }
    clear() {
        this.context = {
            conversationHistory: []
        };
    }
    addToHistory(message) {
        this.context.conversationHistory.push(message);
        // Mantém apenas últimas 10 mensagens
        if (this.context.conversationHistory.length > 10) {
            this.context.conversationHistory.shift();
        }
    }
    STOPWORDS = [
        'quero',
        'buscar',
        'procuro',
        'preciso',
        'comprar',
        'ver',
        'mostrar',
        'gostaria',
        'queria',
        'estou',
        'querendo',
        'buscando',
        'procurando',
        'barato',
        'caro',
        'promoção',
        'promo',
        'oferta',
        'melhor',
        'preço',
        'bom',
        'boa',
        'top',
        'legal',
        'muito',
        'mais',
        'menos'
    ];
    CONDITION_MAP = {
        'novo': 'new',
        'nova': 'new',
        'usado': 'used',
        'usada': 'used',
        'seminovo': 'used',
        'seminova': 'used'
    };
    extractProduct(query) {
        const words = query.toLowerCase().split(/\s+/).filter((w)=>w.length > 2 && !this.STOPWORDS.includes(w) && !/^\d+$/.test(w));
        if (words.length === 0) return null;
        const invalidStart = [
            'comprar',
            'buscar',
            'ver',
            'mostrar',
            'querer'
        ];
        if (invalidStart.includes(words[0])) return null;
        const product = words.slice(0, 3).join(' ');
        return product.trim();
    }
    applyContext(query) {
        const lower = query.toLowerCase().trim();
        const ctx = this.context;
        // Detecta mudança de contexto ANTES de adicionar ao histórico
        const change = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextChangeDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectContextChange"])(query, ctx.conversationHistory);
        // Agora adiciona ao histórico
        this.addToHistory(query);
        if (change.hasChange && change.type === 'correction') {
            // Usuário corrigiu - usar nova informação
            if (change.newProduct) ctx.lastProduct = change.newProduct;
            if (change.newBrand) ctx.lastBrand = change.newBrand;
            if (change.newCondition) ctx.lastCondition = change.newCondition;
            if (change.newLocation) ctx.lastLocation = change.newLocation;
            // Retorna a query limpa com as novas informações
            const parts = [];
            if (change.newProduct) parts.push(change.newProduct);
            if (change.newBrand) parts.push(change.newBrand);
            if (change.newCondition) parts.push(change.newCondition);
            if (change.newLocation) parts.push(change.newLocation);
            return parts.join(' ').trim() || query;
        }
        // Detecta produto automaticamente se não existe
        const possibleProduct = this.extractProduct(query);
        if (possibleProduct && possibleProduct !== ctx.lastProduct) {
            // Produto mudou - resetar contexto
            ctx.lastProduct = possibleProduct;
            ctx.lastBrand = undefined;
            ctx.lastCondition = undefined;
            ctx.lastPriceMax = undefined;
            ctx.lastLocation = undefined;
        } else if (possibleProduct && !ctx.lastProduct) {
            // Primeiro produto
            ctx.lastProduct = possibleProduct;
        }
        if (!ctx.lastProduct) return query;
        // Condição simples
        if (/^(novo|nova|usado|usada|seminovo|seminova)$/i.test(lower)) {
            const normalized = this.CONDITION_MAP[lower];
            if (normalized) {
                ctx.lastCondition = normalized;
                return `${ctx.lastProduct} ${lower}`;
            }
        }
        // Preço (melhorado - aceita mais variações incluindo k e mil)
        const priceMatch = lower.match(/(até|abaixo de|menos de|menor que|max|maximo|máximo)\s*(\d+(?:[.,]\d+)?)(k|mil)?/i);
        if (priceMatch) {
            let price = parseFloat(priceMatch[2].replace(',', '.'));
            // Converte k ou mil para milhares
            if (priceMatch[3] && (priceMatch[3].toLowerCase() === 'k' || priceMatch[3].toLowerCase() === 'mil')) {
                price *= 1000;
            }
            // Arredonda para inteiro (padrão e-commerce)
            ctx.lastPriceMax = Math.round(price);
            return `${ctx.lastProduct} até ${Math.round(price)}`;
        }
        // Refinamento semântico ("o pro max", "a versão pro")
        if (/^(o|a|os|as)\s+(.+)$/i.test(lower)) {
            const match = lower.match(/^(o|a|os|as)\s+(.+)$/i);
            if (match) {
                return `${ctx.lastProduct} ${match[2]}`;
            }
        }
        // Refinamento de marca
        if (/^(só|apenas|somente)\s+(da|do)\s+(.+)$/i.test(lower)) {
            const match = lower.match(/^(só|apenas|somente)\s+(da|do)\s+(.+)$/i);
            if (match) {
                return `${ctx.lastProduct} ${match[3]}`;
            }
        }
        // Mais barato (retorna query natural)
        if (/(qual o )?(mais barato|menor preço)/i.test(lower)) {
            return `${ctx.lastProduct} mais barato`;
        }
        // Mudar condição com palavras extras
        if (/(agora|prefiro|quero|procura|buscar)?\s*(novo|nova|usado|usada|seminovo|seminova)/i.test(lower)) {
            const condMatch = lower.match(/(novo|nova|usado|usada|seminovo|seminova)/i);
            if (condMatch) {
                const normalized = this.CONDITION_MAP[condMatch[1]];
                if (normalized) {
                    ctx.lastCondition = normalized;
                }
            }
            return `${ctx.lastProduct} ${query}`;
        }
        // Mudar localização
        if (/(em|na|no|perto de)\s+(.+)/i.test(lower)) {
            const locMatch = lower.match(/(em|na|no|perto de)\s+(.+)/i);
            if (locMatch) {
                ctx.lastLocation = locMatch[2].trim();
            }
            return `${ctx.lastProduct} ${query}`;
        }
        return query;
    }
}
const contextManager = new ContextManager();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Stop words expandidas para melhor filtragem
__turbopack_context__.s([
    "BRAND_SET",
    ()=>BRAND_SET,
    "GENERIC_PRODUCTS",
    ()=>GENERIC_PRODUCTS,
    "NON_PRODUCT_WORDS",
    ()=>NON_PRODUCT_WORDS,
    "QUESTION_WORDS",
    ()=>QUESTION_WORDS,
    "STOP_WORDS",
    ()=>STOP_WORDS
]);
const STOP_WORDS = new Set([
    'entao',
    'então',
    'comprar',
    'eu',
    'de',
    'para',
    'com',
    'por',
    'o',
    'a',
    'os',
    'as',
    'um',
    'uma',
    'uns',
    'umas',
    'do',
    'da',
    'dos',
    'das',
    'no',
    'na',
    'nos',
    'nas',
    'ao',
    'à',
    'aos',
    'às',
    'pelo',
    'pela',
    'pelos',
    'pelas',
    'em',
    'que',
    'se',
    'te',
    'me',
    'lhe',
    'nos',
    'vos',
    'lhes',
    'meu',
    'minha',
    'meus',
    'minhas',
    'teu',
    'tua',
    'teus',
    'tuas',
    'seu',
    'sua',
    'seus',
    'suas',
    'nosso',
    'nossa',
    'nossos',
    'nossas',
    'vosso',
    'vossa',
    'vossos',
    'vossas',
    'este',
    'esta',
    'estes',
    'estas',
    'esse',
    'essa',
    'esses',
    'essas',
    'aquele',
    'aquela',
    'aqueles',
    'aquelas',
    'isto',
    'isso',
    'aquilo',
    'quero',
    'preciso',
    'busco',
    'procuro',
    'gostaria',
    'estou',
    'sou',
    'tenho',
    'vou',
    'vai',
    'pode',
    'posso',
    'querendo',
    'buscando',
    'procurando',
    'interessado',
    'interessada'
]);
const QUESTION_WORDS = new Set([
    'como',
    'quando',
    'onde',
    'porque',
    'por que',
    'qual',
    'quais',
    'quanto',
    'quantos',
    'quantas',
    'quem',
    'o que',
    'que',
    'funciona',
    'serve',
    'é',
    'são',
    'tem',
    'existe',
    'posso',
    'pode',
    'consegue',
    'faz',
    'fazem'
]);
const NON_PRODUCT_WORDS = new Set([
    'obrigado',
    'obrigada',
    'obg',
    'vlw',
    'valeu',
    'tchau',
    'bye',
    'falou',
    'beleza',
    'ok',
    'certo',
    'entendi',
    'sim',
    'não',
    'nao',
    'talvez',
    'oi',
    'olá',
    'ola',
    'bom dia',
    'boa tarde',
    'boa noite',
    'tudo bem',
    'como vai',
    'e ai',
    'eai',
    'salve',
    'fala',
    'help',
    'ajuda',
    'socorro'
]);
const BRAND_SET = new Set([
    // Eletrônicos
    'samsung',
    'apple',
    'xiaomi',
    'motorola',
    'lg',
    'sony',
    'huawei',
    'nokia',
    'realme',
    'oneplus',
    'oppo',
    'vivo',
    'asus',
    'acer',
    'dell',
    'hp',
    'lenovo',
    'microsoft',
    'intel',
    'amd',
    'nvidia',
    'canon',
    'nikon',
    'panasonic',
    // Eletrodomésticos
    'brastemp',
    'consul',
    'electrolux',
    'ge',
    'bosch',
    'fischer',
    'midea',
    'philco',
    'britania',
    'mondial',
    'cadence',
    'oster',
    'hamilton beach',
    'kitchenaid',
    'arno',
    'black decker',
    'tramontina',
    // Moda/Calçados
    'nike',
    'adidas',
    'puma',
    'vans',
    'converse',
    'fila',
    'mizuno',
    'asics',
    'new balance',
    'reebok',
    'under armour',
    'lacoste',
    'polo',
    'tommy',
    'calvin klein',
    'guess',
    'zara',
    'hm',
    'c&a',
    'renner',
    'riachuelo',
    'on',
    'on running',
    'hoka',
    'brooks',
    'saucony',
    'olympikus',
    // Automotivo
    'volkswagen',
    'ford',
    'chevrolet',
    'fiat',
    'toyota',
    'honda',
    'hyundai',
    'nissan',
    'renault',
    'peugeot',
    'citroen',
    'bmw',
    'mercedes',
    'audi',
    'jeep',
    'mitsubishi',
    'kia',
    'suzuki',
    'volvo',
    'land rover',
    // Casa/Móveis
    'tok stok',
    'casas bahia',
    'magazine luiza',
    'leroy merlin',
    'telhanorte',
    'madeira madeira',
    'mobly',
    'westwing',
    'etna',
    'deca',
    'docol',
    'tigre'
]);
const GENERIC_PRODUCTS = {
    'celular': [
        'iPhone',
        'Samsung Galaxy',
        'Xiaomi Redmi',
        'Motorola Moto',
        'LG'
    ],
    'smartphone': [
        'iPhone',
        'Samsung Galaxy',
        'Xiaomi Redmi',
        'Motorola Moto',
        'LG'
    ],
    'telefone': [
        'iPhone',
        'Samsung Galaxy',
        'Xiaomi Redmi',
        'Motorola Moto',
        'LG'
    ],
    'geladeira': [
        'Brastemp',
        'Consul',
        'Electrolux',
        'LG',
        'Samsung'
    ],
    'fogao': [
        'Brastemp',
        'Consul',
        'Electrolux',
        'Fischer',
        'Dako'
    ],
    'fogão': [
        'Brastemp',
        'Consul',
        'Electrolux',
        'Fischer',
        'Dako'
    ],
    'tv': [
        'Samsung',
        'LG',
        'Sony',
        'Philco',
        'TCL'
    ],
    'televisao': [
        'Samsung',
        'LG',
        'Sony',
        'Philco',
        'TCL'
    ],
    'televisão': [
        'Samsung',
        'LG',
        'Sony',
        'Philco',
        'TCL'
    ],
    'notebook': [
        'Dell',
        'HP',
        'Lenovo',
        'Asus',
        'Acer'
    ],
    'laptop': [
        'Dell',
        'HP',
        'Lenovo',
        'Asus',
        'Acer'
    ],
    'carro': [
        'Volkswagen',
        'Ford',
        'Chevrolet',
        'Fiat',
        'Toyota'
    ],
    'veiculo': [
        'Volkswagen',
        'Ford',
        'Chevrolet',
        'Fiat',
        'Toyota'
    ],
    'veículo': [
        'Volkswagen',
        'Ford',
        'Chevrolet',
        'Fiat',
        'Toyota'
    ],
    'moto': [
        'Honda',
        'Yamaha',
        'Suzuki',
        'Kawasaki',
        'BMW'
    ],
    'motocicleta': [
        'Honda',
        'Yamaha',
        'Suzuki',
        'Kawasaki',
        'BMW'
    ],
    'tenis': [
        'Nike',
        'Adidas',
        'Puma',
        'Vans',
        'Converse'
    ],
    'tênis': [
        'Nike',
        'Adidas',
        'Puma',
        'Vans',
        'Converse'
    ],
    'sapato': [
        'Nike',
        'Adidas',
        'Puma',
        'Vans',
        'Converse'
    ],
    'bicicleta': [
        'Caloi',
        'Oggi',
        'Sense',
        'Specialized',
        'Trek'
    ],
    'bike': [
        'Caloi',
        'Hoje',
        'Sense',
        'Specialized',
        'Trek'
    ],
    'relogio': [
        'Apple Watch',
        'Samsung Galaxy Watch',
        'Garmin',
        'Fossil',
        'Casio'
    ],
    'relógio': [
        'Apple Watch',
        'Samsung Galaxy Watch',
        'Garmin',
        'Fossil',
        'Casio'
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/textNormalizer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "lightNormalize",
    ()=>lightNormalize,
    "normalizeAccents",
    ()=>normalizeAccents,
    "normalizeText",
    ()=>normalizeText,
    "removePunctuation",
    ()=>removePunctuation,
    "removeStopWords",
    ()=>removeStopWords
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/constants.ts [app-client] (ecmascript)");
;
function normalizeAccents(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function removePunctuation(text) {
    return text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function removeStopWords(text) {
    return text.split(' ').filter((word)=>word.length > 0 && !__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STOP_WORDS"].has(word)).join(' ');
}
function normalizeText(text) {
    // Ordem importante: pontuação PRIMEIRO, depois acentos, depois stop words
    let normalized = removePunctuation(text);
    normalized = normalizeAccents(normalized);
    normalized = removeStopWords(normalized);
    return normalized.trim();
}
function lightNormalize(text) {
    return normalizeAccents(text.trim());
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/queryProcessor.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanProductQuery",
    ()=>cleanProductQuery,
    "extractProductInfo",
    ()=>extractProductInfo,
    "hasSpecificModel",
    ()=>hasSpecificModel,
    "suggestQueryImprovements",
    ()=>suggestQueryImprovements
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$textNormalizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/textNormalizer.ts [app-client] (ecmascript)");
;
;
// Padrões de intenção de compra que devem ser removidos
const PURCHASE_INTENT_PATTERNS = [
    /^(estou|to|tou)\s+(querendo|buscando|procurando|interessado|interessada)\s+/i,
    /^(quero|preciso|busco|procuro|gostaria)\s+(de\s+)?/i,
    /^(vou|vamos)\s+(comprar|buscar)\s+/i,
    /^(me\s+)?(ajuda|ajudem?)\s+(a\s+)?(encontrar|achar)\s+/i
];
// Artigos e preposições específicas para produtos
const PRODUCT_ARTICLES = new Set([
    'um',
    'uma',
    'uns',
    'umas',
    'o',
    'a',
    'os',
    'as'
]);
function cleanProductQuery(query) {
    let cleaned = query.toLowerCase().trim();
    // Remove padrões de intenção de compra
    for (const pattern of PURCHASE_INTENT_PATTERNS){
        cleaned = cleaned.replace(pattern, '');
    }
    // Remove artigos no início
    const words = cleaned.split(/\s+/);
    if (words.length > 1 && PRODUCT_ARTICLES.has(words[0])) {
        words.shift();
        cleaned = words.join(' ');
    }
    // Se ficou vazio, retorna a query original
    const result = cleaned.trim();
    return result || query.toLowerCase().trim();
}
function hasSpecificModel(query) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$textNormalizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeAccents"])(query.toLowerCase());
    // Padrões de modelos específicos
    const modelPatterns = [
        /iphone\s+(\d+|se|x|xs|xr|pro|max|mini|plus)/i,
        /galaxy\s+(s\d+|note|a\d+|j\d+)/i,
        /redmi\s+(note|\d+)/i,
        /moto\s+(g\d+|e\d+|x\d+)/i,
        /\b(i[357]|ryzen\s*[357])\b/i,
        /\b\d+gb\b/i,
        /\b\d+\\\"\b/i,
        /\b\d+\s*(polegadas|pol)\b/i
    ];
    return modelPatterns.some((pattern)=>pattern.test(normalized));
}
function suggestQueryImprovements(query) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$textNormalizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeAccents"])(query.toLowerCase());
    const suggestions = [];
    // Sugestões baseadas no produto
    if (normalized.includes('iphone')) {
        suggestions.push('iPhone 15 Pro', 'iPhone 14', 'iPhone SE');
    } else if (normalized.includes('samsung') || normalized.includes('galaxy')) {
        suggestions.push('Samsung Galaxy S24', 'Galaxy A54', 'Galaxy Note');
    } else if (normalized.includes('notebook')) {
        suggestions.push('notebook gamer', 'notebook i7', 'notebook Dell');
    } else if (normalized.includes('tv')) {
        suggestions.push('Smart TV 50 polegadas', 'TV Samsung', 'TV LG');
    }
    return suggestions;
}
function extractProductInfo(query) {
    const cleaned = cleanProductQuery(query);
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$textNormalizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeAccents"])(cleaned.toLowerCase());
    const words = normalized.split(/\s+/).filter((word)=>word.length > 0);
    let brand = '';
    let product = '';
    let model = '';
    let priceMax;
    let attributes = [];
    // Detecta filtro de preço
    const priceMatch = query.match(/(até|abaixo de|menor que|máximo)\s*(de\s*)?r?\$?\s*(\d+)/i);
    if (priceMatch) {
        priceMax = Number(priceMatch[3]);
    }
    // Detecta marca
    for (const word of words){
        if (__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BRAND_SET"].has(word)) {
            brand = word;
            break;
        }
    }
    // Detecta produto principal (primeira palavra não-stop)
    for (const word of words){
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STOP_WORDS"].has(word) && word !== brand && word.length > 2) {
            product = word;
            break;
        }
    }
    // Se não encontrou produto, usa a primeira palavra
    if (!product && words.length > 0) {
        product = words[0];
    }
    // Detecta modelo (números + letras)
    const MODEL_BLACKLIST = new Set([
        'gamer',
        'barato',
        'novo',
        'usado',
        'seminovo',
        'ultra',
        'nova',
        'novos',
        'novas',
        'usada',
        'usados',
        'usadas'
    ]);
    const modelPattern = /\b(\d+[a-z]*|[a-z]+\d+|pro|max|mini|plus|se|note)\b/i;
    for (const word of words){
        if (modelPattern.test(word) && word !== product && !MODEL_BLACKLIST.has(word)) {
            model = word;
            break;
        }
    }
    // Resto são atributos (remove condições)
    const CONDITION_WORDS = new Set([
        'novo',
        'nova',
        'novos',
        'novas',
        'usado',
        'usada',
        'usados',
        'usadas',
        'seminovo',
        'seminova'
    ]);
    attributes = words.filter((word)=>!__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STOP_WORDS"].has(word) && !CONDITION_WORDS.has(word) && word !== brand && word !== product && word !== model && !/\d+/.test(word) // Remove números de preço
    );
    return {
        original: query,
        cleaned,
        brand,
        product,
        model,
        priceMax,
        attributes,
        hasSpecificModel: hasSpecificModel(cleaned),
        isGeneric: !brand && !model && attributes.length === 0 && !hasSpecificModel(cleaned)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/brandDetector.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Sistema de detecção inteligente de marca e enriquecimento de dados
__turbopack_context__.s([
    "detectCondition",
    ()=>detectCondition,
    "detectModelAndBrand",
    ()=>detectModelAndBrand,
    "detectProductEntity",
    ()=>detectProductEntity,
    "detectProductVersion",
    ()=>detectProductVersion,
    "detectSearchIntent",
    ()=>detectSearchIntent,
    "enrichProductQuery",
    ()=>enrichProductQuery,
    "generateSmartBrandQuestion",
    ()=>generateSmartBrandQuestion,
    "normalizeProductAliases",
    ()=>normalizeProductAliases,
    "optimizeQueryOrder",
    ()=>optimizeQueryOrder
]);
// Tokens conhecidos para split inteligente
const KNOWN_TOKENS = [
    'nike',
    'air',
    'max',
    'force',
    'jordan',
    'adidas',
    'ultra',
    'boost',
    'new',
    'balance',
    'asics',
    'gel',
    'puma',
    'tenis'
];
// Product Aliases - Sinônimos de produtos
const PRODUCT_ALIASES = {
    'tenis': [
        'tênis',
        'sneaker',
        'running shoe',
        'tenis de corrida',
        'airmax'
    ],
    'celular': [
        'smartphone',
        'phone',
        'telefone'
    ],
    'notebook': [
        'laptop',
        'computador portátil'
    ],
    'tv': [
        'televisão',
        'televisao',
        'smart tv'
    ],
    'geladeira': [
        'refrigerador',
        'freezer'
    ],
    'fogao': [
        'fogão',
        'cooktop'
    ],
    'carro': [
        'veículo',
        'veiculo',
        'automóvel',
        'automovel'
    ],
    'moto': [
        'motocicleta',
        'motorcycle'
    ]
};
// Product Entities - Produtos específicos com categoria e marca
const PRODUCT_ENTITIES = {
    'iphone': {
        category: 'smartphone',
        brand: 'apple',
        aliases: [
            'iphone',
            'apple iphone'
        ]
    },
    'macbook': {
        category: 'laptop',
        brand: 'apple',
        aliases: [
            'macbook',
            'apple macbook'
        ]
    },
    'ipad': {
        category: 'tablet',
        brand: 'apple',
        aliases: [
            'ipad',
            'apple ipad'
        ]
    },
    'galaxy': {
        category: 'smartphone',
        brand: 'samsung',
        aliases: [
            'galaxy',
            'samsung galaxy'
        ]
    },
    'ps5': {
        category: 'console',
        brand: 'sony',
        aliases: [
            'playstation 5',
            'playstation',
            'ps5'
        ]
    },
    'xbox': {
        category: 'console',
        brand: 'microsoft',
        aliases: [
            'xbox series',
            'xbox one'
        ]
    },
    'switch': {
        category: 'console',
        brand: 'nintendo',
        aliases: [
            'nintendo switch'
        ]
    }
};
// Product Knowledge Graph - Modelos específicos (ordenado por tamanho)
const MODEL_KNOWLEDGE = {
    'cloudrunner 2': {
        brand: 'on running',
        category: 'running shoe',
        fullName: 'On Cloudrunner 2'
    },
    'cloudrunner': {
        brand: 'on running',
        category: 'running shoe',
        fullName: 'On Cloudrunner'
    },
    'cloudflow': {
        brand: 'on running',
        category: 'running shoe',
        fullName: 'On Cloudflow'
    },
    'cloudswift': {
        brand: 'on running',
        category: 'running shoe',
        fullName: 'On Cloudswift'
    },
    'air max 270': {
        brand: 'nike',
        category: 'running shoe',
        fullName: 'Nike Air Max 270'
    },
    'air max 90': {
        brand: 'nike',
        category: 'running shoe',
        fullName: 'Nike Air Max 90'
    },
    'air max': {
        brand: 'nike',
        category: 'running shoe',
        fullName: 'Nike Air Max'
    },
    'air force 1': {
        brand: 'nike',
        category: 'sneaker',
        fullName: 'Nike Air Force 1'
    },
    'air force': {
        brand: 'nike',
        category: 'sneaker',
        fullName: 'Nike Air Force'
    },
    'jordan 1': {
        brand: 'nike',
        category: 'sneaker',
        fullName: 'Air Jordan 1'
    },
    'jordan': {
        brand: 'nike',
        category: 'sneaker',
        fullName: 'Air Jordan'
    },
    'ultraboost 22': {
        brand: 'adidas',
        category: 'running shoe',
        fullName: 'Adidas Ultraboost 22'
    },
    'ultraboost': {
        brand: 'adidas',
        category: 'running shoe',
        fullName: 'Adidas Ultraboost'
    },
    'nmd': {
        brand: 'adidas',
        category: 'sneaker',
        fullName: 'Adidas NMD'
    },
    'superstar': {
        brand: 'adidas',
        category: 'sneaker',
        fullName: 'Adidas Superstar'
    },
    'yeezy': {
        brand: 'adidas',
        category: 'sneaker',
        fullName: 'Adidas Yeezy'
    },
    'suede': {
        brand: 'puma',
        category: 'sneaker',
        fullName: 'Puma Suede'
    },
    'rs-x': {
        brand: 'puma',
        category: 'sneaker',
        fullName: 'Puma RS-X'
    },
    'gel kayano': {
        brand: 'asics',
        category: 'running shoe',
        fullName: 'Asics Gel Kayano'
    },
    'gel nimbus': {
        brand: 'asics',
        category: 'running shoe',
        fullName: 'Asics Gel Nimbus'
    },
    'gel': {
        brand: 'asics',
        category: 'running shoe',
        fullName: 'Asics Gel'
    },
    '990v5': {
        brand: 'new balance',
        category: 'running shoe',
        fullName: 'New Balance 990v5'
    },
    '990': {
        brand: 'new balance',
        category: 'running shoe',
        fullName: 'New Balance 990'
    },
    '574': {
        brand: 'new balance',
        category: 'sneaker',
        fullName: 'New Balance 574'
    }
};
// Versões válidas por linha de produto (evita capturar tamanhos/anos)
const VALID_VERSIONS = {
    'air max': [
        '90',
        '95',
        '97',
        '98',
        '200',
        '270',
        '720',
        '2090'
    ],
    'air force': [
        '1',
        '07'
    ],
    'jordan': [
        '1',
        '3',
        '4',
        '5',
        '6',
        '11',
        '12',
        '13'
    ],
    'ultraboost': [
        '19',
        '20',
        '21',
        '22',
        '23'
    ],
    'gel': [
        '1090',
        '1130'
    ],
    '990': [
        'v3',
        'v4',
        'v5',
        'v6'
    ]
};
// Ordenar modelos por tamanho (mais específicos primeiro)
const SORTED_MODELS = Object.entries(MODEL_KNOWLEDGE).sort(_c = (a, b)=>b[0].length - a[0].length);
_c1 = SORTED_MODELS;
// Base de conhecimento de marcas específicas
const BRAND_KNOWLEDGE = {
    'on': {
        name: 'On Running',
        category: 'running shoe',
        aliases: [
            'on running',
            'on shoes'
        ]
    },
    'nike': {
        name: 'Nike',
        category: 'sportswear',
        aliases: [
            'nike'
        ]
    },
    'adidas': {
        name: 'Adidas',
        category: 'sportswear',
        aliases: [
            'adidas'
        ]
    }
};
// Regex para produtos que precisam de gênero (mais robusto)
const GENDER_PRODUCT_REGEX = /\b(tenis|tênis|sapato|bota|sandalia|sandália|camisa|camiseta|blusa|calça|short|bermuda|jaqueta|casaco|moletom)\b/i;
// Regex para versões de produtos
const VERSION_PATTERNS = {
    iphone: /iphone\s*(\d+)\s*(pro|max|plus|mini)?\s*(max)?/i,
    galaxy: /galaxy\s*(s|note|a|z)?\s*(\d+)\s*(ultra|plus)?/i,
    macbook: /macbook\s*(air|pro)?\s*(\d+)?/i
};
// Palavras de intenção
const INTENT_KEYWORDS = {
    priceSensitive: [
        'barato',
        'barata',
        'promoção',
        'promocao',
        'desconto',
        'oferta',
        'economico'
    ],
    premium: [
        'top',
        'melhor',
        'premium',
        'luxo',
        'flagship'
    ],
    features: [
        'camera',
        'câmera',
        'bateria',
        'tela',
        'processador',
        'memoria'
    ]
};
/**
 * Normaliza query com split inteligente (Token Matching)
 * airmax97 -> air max 97
 * nikeairmax -> nike air max
 */ function smartNormalize(query) {
    let normalized = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2').replace(/[^a-z0-9 ]/g, ' ');
    // Split tokens colados
    for (const token of KNOWN_TOKENS){
        const pattern = new RegExp(`(${token})`, 'g');
        normalized = normalized.replace(pattern, ' $1 ');
    }
    return normalized.replace(/\s+/g, ' ').trim();
}
function normalizeProductAliases(query) {
    // Aplica smart normalize primeiro
    let normalized = smartNormalize(query);
    // Depois aplica aliases
    for (const [canonical, aliases] of Object.entries(PRODUCT_ALIASES)){
        for (const alias of aliases){
            const pattern = new RegExp(`\\b${alias}\\b`, 'gi');
            normalized = normalized.replace(pattern, canonical);
        }
    }
    return normalized;
}
function detectProductVersion(query) {
    const normalized = query.toLowerCase();
    const iphoneMatch = normalized.match(VERSION_PATTERNS.iphone);
    if (iphoneMatch) {
        return {
            product: 'iphone',
            version: iphoneMatch[1],
            variant: [
                iphoneMatch[2],
                iphoneMatch[3]
            ].filter(Boolean).join(' ') || undefined
        };
    }
    const galaxyMatch = normalized.match(VERSION_PATTERNS.galaxy);
    if (galaxyMatch) {
        return {
            product: 'galaxy',
            version: `${galaxyMatch[1] || ''}${galaxyMatch[2] || ''}`.trim(),
            variant: galaxyMatch[3] || undefined
        };
    }
    return {};
}
function detectSearchIntent(query) {
    const normalized = query.toLowerCase();
    const intent = {};
    if (INTENT_KEYWORDS.priceSensitive.some((kw)=>normalized.includes(kw))) {
        intent.priceSensitive = true;
    }
    if (INTENT_KEYWORDS.premium.some((kw)=>normalized.includes(kw))) {
        intent.premium = true;
    }
    for (const feature of INTENT_KEYWORDS.features){
        if (normalized.includes(feature)) {
            intent.feature = feature;
            break;
        }
    }
    return intent;
}
function detectProductEntity(query) {
    const normalized = query.toLowerCase();
    for (const [productKey, productInfo] of Object.entries(PRODUCT_ENTITIES)){
        const pattern = new RegExp(`\\b${productKey}\\b`, 'i');
        if (pattern.test(normalized)) {
            return {
                brand: productInfo.brand,
                category: productInfo.category
            };
        }
    }
    return {};
}
function detectModelAndBrand(query) {
    const normalized = query.toLowerCase();
    // Busca no knowledge graph (modelos mais específicos primeiro)
    for (const [modelKey, modelInfo] of SORTED_MODELS){
        const pattern = new RegExp(`\\b${modelKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (pattern.test(normalized)) {
            let fullModel = modelInfo.fullName;
            // Captura versão logo após o modelo (evita anos/tamanhos distantes)
            const versionPattern = new RegExp(`${modelKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\d{1,4})`, 'i');
            const versionMatch = normalized.match(versionPattern);
            if (versionMatch && versionMatch[1]) {
                // Valida se é versão válida para essa linha de produto
                const validVersions = VALID_VERSIONS[modelKey];
                if (!validVersions || validVersions.includes(versionMatch[1])) {
                    fullModel = `${modelInfo.fullName} ${versionMatch[1]}`;
                }
            }
            return {
                brand: modelInfo.brand,
                model: fullModel,
                category: modelInfo.category
            };
        }
    }
    return {};
}
function detectCondition(query) {
    const normalized = query.toLowerCase();
    // Detecta "usado" e variações
    if (/\b(usado|usada|usados|usadas|seminovo|seminova|semi-novo|semi-nova)\b/i.test(normalized)) {
        return 'usado';
    }
    // Detecta "novo" e variações
    if (/\b(novo|nova|novos|novas|lacrado|lacrada|na caixa|zero|0km)\b/i.test(normalized)) {
        return 'novo';
    }
    return undefined;
}
/**
 * Remove condição da query (evita duplicação)
 */ function removeCondition(query) {
    return query.replace(/\b(novo|nova|novos|novas|usado|usada|usados|usadas|seminovo|seminova|lacrado|lacrada)\b/gi, '').replace(/\s+/g, ' ').trim();
}
function enrichProductQuery(query) {
    // 0. Normaliza aliases
    const normalizedQuery = normalizeProductAliases(query);
    // Remove condição para evitar duplicação no modelo
    const queryWithoutCondition = removeCondition(normalizedQuery);
    const normalized = queryWithoutCondition.toLowerCase();
    // 1. Detecta versão
    const versionInfo = detectProductVersion(query);
    // 2. Detecta produto específico
    const productEntity = detectProductEntity(query);
    // 3. Detecta modelo e marca (usa query sem condição)
    const modelDetection = detectModelAndBrand(queryWithoutCondition);
    const detectedBrand = modelDetection.brand || productEntity.brand;
    let detectedModel = modelDetection.model;
    // Enriquece com versão
    if (versionInfo.version) {
        const versionStr = [
            versionInfo.version,
            versionInfo.variant
        ].filter(Boolean).join(' ');
        detectedModel = detectedModel ? `${detectedModel} ${versionStr}` : versionStr;
    }
    const category = modelDetection.category || productEntity.category;
    // 4. Detecta condição (da query original)
    const condition = detectCondition(query);
    // 5. Detecta intenção
    const intent = detectSearchIntent(query);
    // 6. Verifica gênero
    const needsGenderQuestion = GENDER_PRODUCT_REGEX.test(normalized);
    // 7. Verifica condição
    const needsConditionQuestion = !condition;
    // 8. Constrói query enriquecida (sem condição)
    let enrichedQuery = queryWithoutCondition;
    if (detectedBrand && !normalized.includes(detectedBrand.toLowerCase())) {
        enrichedQuery = `${detectedBrand} ${enrichedQuery}`;
    }
    if (category && !normalized.includes(category)) {
        enrichedQuery = `${enrichedQuery} ${category}`;
    }
    return {
        detectedBrand,
        detectedModel,
        category,
        condition,
        needsGenderQuestion,
        needsConditionQuestion,
        enrichedQuery: enrichedQuery.trim(),
        intent
    };
}
function optimizeQueryOrder(parts) {
    const ordered = [];
    // 1. PRODUTO PRIMEIRO (tenis, celular, notebook)
    if (parts.product) {
        ordered.push(parts.product);
    } else if (!parts.product && parts.model && /air|jordan|ultra|gel|990|574|suede|nmd|yeezy/i.test(parts.model)) {
        ordered.push('tenis');
    }
    // 2. MARCA (nike, adidas, samsung)
    if (parts.brand) {
        ordered.push(parts.brand);
    }
    // 3. MODELO (air max 97, iphone 15)
    if (parts.model) {
        // Só adiciona se não estiver duplicado no produto
        if (!parts.product || !parts.model.toLowerCase().includes(parts.product.toLowerCase())) {
            ordered.push(parts.model);
        } else {
            ordered.push(parts.model);
        }
    }
    // 4. ATRIBUTOS (256gb, preto, gamer)
    if (parts.attributes) {
        for (const attr of parts.attributes){
            // Só adiciona atributos que não estão no modelo
            if (!parts.model || !parts.model.toLowerCase().includes(attr.toLowerCase())) {
                ordered.push(attr);
            }
        }
    }
    // 5. GÊNERO (masculino, feminino)
    if (parts.gender) {
        ordered.push(parts.gender);
    }
    // 6. CONDIÇÃO (novo, usado) - NÃO ADICIONA AQUI, vai no buildGoogleSearchQuery
    // Condição é filtro, não parte da query base
    return ordered.join(' ').trim();
}
function generateSmartBrandQuestion(detectedBrand, originalQuery) {
    const normalized = originalQuery.toLowerCase();
    // Se detectou On Running
    if (detectedBrand === 'on running') {
        return {
            question: `Detectei que você quer um ${detectedBrand}. Confirma?`,
            options: [
                'Sim, quero On Running',
                'Não, qualquer marca serve'
            ]
        };
    }
    // Pergunta genérica
    return {
        question: `Detectei a marca ${detectedBrand}. Está correto?`,
        options: [
            `Sim, ${detectedBrand}`,
            'Não, outra marca'
        ]
    };
}
var _c, _c1;
__turbopack_context__.k.register(_c, "SORTED_MODELS$Object.entries(MODEL_KNOWLEDGE)\n  .sort");
__turbopack_context__.k.register(_c1, "SORTED_MODELS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/googleQueryBuilder.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Construtor de query otimizada para Google Search
__turbopack_context__.s([
    "buildGoogleSearchQuery",
    ()=>buildGoogleSearchQuery
]);
/**
 * Remove acentos para melhor recall
 */ function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
/**
 * Converte filtro de preço para valor numérico
 */ function extractPriceValue(priceFilter) {
    const match = priceFilter.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1].replace('.', '')) : null;
}
/**
 * Mapeia resposta do usuário para formato da API
 */ function mapSortByToAPI(userChoice) {
    if (!userChoice) return 'BEST_MATCH';
    const normalized = userChoice.toLowerCase();
    if (normalized.includes('menor') || normalized.includes('barato')) {
        return 'LOWEST_PRICE';
    }
    if (normalized.includes('maior') || normalized.includes('caro')) {
        return 'HIGHEST_PRICE';
    }
    return 'BEST_MATCH';
}
function buildGoogleSearchQuery(baseQuery, filters) {
    const parts = [];
    // 1. Base query (produto + marca + modelo)
    const cleanBase = baseQuery.trim();
    parts.push(cleanBase);
    // 2. Adiciona condição (remove acentos)
    if (filters.condition && filters.condition !== 'Tanto faz') {
        parts.push(removeAccents(filters.condition.toLowerCase()));
    }
    // 3. PREÇO NÃO VAI NA QUERY - Extrair para filtro separado
    let minPrice;
    let maxPrice;
    if (filters.priceMax) {
        const price = extractPriceValue(filters.priceMax);
        if (price) {
            if (filters.priceMax.includes('Acima')) {
                minPrice = price;
            } else {
                maxPrice = price;
            }
        }
    }
    // 4. Adiciona localização (remove acentos)
    if (filters.location && filters.location !== 'não' && filters.location !== 'nao') {
        parts.push(removeAccents(filters.location));
    }
    // 5. Adiciona armazenamento
    if (filters.storage && filters.storage !== 'Tanto faz') {
        parts.push(filters.storage);
    }
    // 6. Adiciona gênero (remove acentos)
    if (filters.gender) {
        parts.push(removeAccents(filters.gender.toLowerCase()));
    }
    return {
        query: parts.join(' ').trim(),
        sortBy: mapSortByToAPI(filters.sortBy),
        minPrice,
        maxPrice
    };
} /**
 * Exemplo de uso:
 * 
 * buildGoogleSearchQuery('iphone 13 pro', {
 *   condition: 'Usado',
 *   priceMax: 'Até R$ 3.000'
 * })
 * 
 * Resultado: "iphone 13 pro" usado ate R$3000 preco
 */ 
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/productParser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildSearchQuery",
    ()=>buildSearchQuery,
    "parseProductQuery",
    ()=>parseProductQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$queryProcessor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/queryProcessor.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$brandDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/brandDetector.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$googleQueryBuilder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/googleQueryBuilder.ts [app-client] (ecmascript)");
;
;
;
;
// Algoritmo de Levenshtein para fuzzy matching
function levenshtein(a, b) {
    const matrix = Array(b.length + 1).fill(null).map(()=>Array(a.length + 1).fill(null));
    for(let i = 0; i <= a.length; i++)matrix[0][i] = i;
    for(let j = 0; j <= b.length; j++)matrix[j][0] = j;
    for(let j = 1; j <= b.length; j++){
        for(let i = 1; i <= a.length; i++){
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + cost);
        }
    }
    return matrix[b.length][a.length];
}
// Encontra marca mais próxima usando fuzzy matching otimizado
function findClosestBrand(word) {
    if (word.length < 4) return null;
    const normalized = word.toLowerCase();
    // Match exato primeiro
    if (__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BRAND_SET"].has(normalized)) {
        return normalized;
    }
    // Otimização: filtra por primeira letra
    const tolerance = word.length <= 5 ? 1 : 2;
    for (const brand of __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BRAND_SET"]){
        // Pula se primeira letra é muito diferente
        if (Math.abs(brand.charCodeAt(0) - normalized.charCodeAt(0)) > 2) continue;
        const distance = levenshtein(normalized, brand);
        if (distance <= tolerance) {
            return brand;
        }
    }
    return null;
}
function parseProductQuery(query) {
    // Enriquece com detecção inteligente de marca (PRIMEIRO - mais preciso)
    const enrichment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$brandDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["enrichProductQuery"])(query);
    // Usa o sistema básico de processamento como fallback
    const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$queryProcessor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractProductInfo"])(query);
    // Detecta condição na query original
    const originalLower = query.toLowerCase();
    let condition;
    if (/\b(novo|nova|new)\b/i.test(originalLower)) {
        condition = 'new';
    } else if (/\b(usado|usada|seminovo|seminova|used)\b/i.test(originalLower)) {
        condition = 'used';
    }
    // PRIORIZA enrichment (Knowledge Graph) sobre extractProductInfo
    let brand = enrichment.detectedBrand || info.brand;
    let model = enrichment.detectedModel || info.model;
    // Aplica fuzzy matching na marca se não foi detectada
    if (!brand && info.product && info.product.length >= 4) {
        const fuzzyBrand = findClosestBrand(info.product);
        const commonProducts = [
            'mesa',
            'cadeira',
            'sofa',
            'cama',
            'armario',
            'guarda',
            'roupa'
        ];
        if (fuzzyBrand && !commonProducts.includes(info.product)) {
            brand = fuzzyBrand;
        }
    }
    // Remove atributos que já estão no modelo (evita "air max air")
    let attributes = info.attributes;
    if (model) {
        const modelLower = model.toLowerCase();
        attributes = attributes.filter((attr)=>!modelLower.includes(attr.toLowerCase()));
    }
    // IMPORTANTE: NÃO remove produto genérico (tenis, celular, etc) mesmo se modelo existir
    // Apenas remove se o produto for parte do nome do modelo (ex: "iphone" em "iPhone 13")
    let product = info.product;
    if (model && product) {
        const modelLower = model.toLowerCase();
        const productLower = product.toLowerCase();
        // Só remove se produto é EXATAMENTE uma palavra do modelo
        const modelWords = modelLower.split(' ');
        if (modelWords.includes(productLower)) {
            product = '';
        }
    }
    // Verifica se é genérico
    const isGeneric = !!(product && __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GENERIC_PRODUCTS"][product] && !brand && !model && attributes.length === 0);
    // Determina se precisa de localização
    const needsLocation = !isGeneric && !info.hasSpecificModel && !model && !brand;
    return {
        product,
        brand,
        model,
        attributes,
        condition,
        isGeneric,
        needsLocation,
        query: enrichment.enrichedQuery
    };
}
function buildSearchQuery(parsed, condition, location, gender, priceMax, storage, sortBy) {
    // Remove marca do model se já está incluída (evita "nike Nike Air Max")
    let cleanModel = parsed.model;
    if (cleanModel && parsed.brand) {
        const brandLower = parsed.brand.toLowerCase();
        const modelLower = cleanModel.toLowerCase();
        if (modelLower.startsWith(brandLower + ' ')) {
            cleanModel = cleanModel.substring(parsed.brand.length + 1);
        }
    }
    // Normaliza para lowercase (consistência)
    if (cleanModel) {
        cleanModel = cleanModel.toLowerCase();
    }
    console.log('🔧 buildSearchQuery - parsed:', {
        brand: parsed.brand,
        model: parsed.model,
        cleanModel,
        product: parsed.product,
        attributes: parsed.attributes
    });
    // Constrói query base SEM condição (evita duplicação)
    const baseQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$brandDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["optimizeQueryOrder"])({
        brand: parsed.brand,
        model: cleanModel,
        product: parsed.product,
        attributes: parsed.attributes,
        gender: undefined,
        condition: undefined
    });
    console.log('🎯 baseQuery após optimizeQueryOrder:', baseQuery);
    // Google Query Builder adiciona tudo e retorna sortBy
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$googleQueryBuilder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildGoogleSearchQuery"])(baseQuery, {
        condition,
        priceMax,
        location,
        storage,
        gender,
        sortBy
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/genericProductHandler.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleGenericProduct",
    ()=>handleGenericProduct
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/constants.ts [app-client] (ecmascript)");
;
function handleGenericProduct(product) {
    const normalized = product.toLowerCase();
    const suggestions = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GENERIC_PRODUCTS"][normalized];
    if (!suggestions) {
        return `Sua busca por "${product}" é muito genérica. Pode ser mais específico? Por exemplo, mencione uma marca ou modelo.`;
    }
    const suggestionList = suggestions.slice(0, 5).join(', ');
    return `Sua busca por "${product}" é muito genérica. Que tal ser mais específico? Por exemplo:
  
• ${suggestions[0]} ${product}
• ${suggestions[1]} ${product}
• ${suggestions[2]} ${product}

Ou mencione alguma característica específica que você procura!`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/advancedNormalizer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Normalizer avançado com tokenização
__turbopack_context__.s([
    "expandWithSynonyms",
    ()=>expandWithSynonyms,
    "normalizeAndTokenize",
    ()=>normalizeAndTokenize
]);
function normalizeAndTokenize(query) {
    const normalized = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
    const tokens = normalized.split(' ').filter((token)=>token.length > 0);
    return {
        normalized,
        tokens
    };
}
// Sistema de sinônimos
const SYNONYMS = {
    celular: [
        'cel',
        'celu',
        'cell',
        'phone'
    ],
    telefone: [
        'phone',
        'fone'
    ],
    notebook: [
        'note',
        'laptop',
        'computador'
    ],
    televisao: [
        'tv',
        'televisao'
    ],
    geladeira: [
        'refrigerador',
        'frigobar'
    ],
    fogao: [
        'fogao',
        'cooktop'
    ],
    carro: [
        'automovel',
        'veiculo'
    ],
    moto: [
        'motocicleta',
        'bike'
    ]
};
function expandWithSynonyms(tokens) {
    const expanded = [
        ...tokens
    ];
    for (const token of tokens){
        for (const [main, synonyms] of Object.entries(SYNONYMS)){
            // Main → sinônimos
            if (token === main) {
                expanded.push(...synonyms);
            }
            // Sinônimo → main
            if (synonyms.includes(token)) {
                expanded.push(main);
            }
        }
    }
    return [
        ...new Set(expanded)
    ]; // Remove duplicatas
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/categorySystem.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Sistema de categorização inteligente de produtos
__turbopack_context__.s([
    "PRODUCT_CATEGORIES",
    ()=>PRODUCT_CATEGORIES,
    "detectProductCategory",
    ()=>detectProductCategory,
    "detectProductCategoryWithRanking",
    ()=>detectProductCategoryWithRanking,
    "formatCategoryQuestion",
    ()=>formatCategoryQuestion,
    "isCategoryConfident",
    ()=>isCategoryConfident
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$advancedNormalizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/advancedNormalizer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$brandDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/brandDetector.ts [app-client] (ecmascript)");
const PRODUCT_CATEGORIES = {
    smartphone: {
        name: 'Smartphone',
        keywords: [
            'iphone',
            'samsung',
            'xiaomi',
            'motorola',
            'celular',
            'smartphone',
            'telefone',
            'galaxy',
            'redmi',
            'cel',
            'cell',
            'android',
            'ios'
        ],
        patterns: [
            /\biphone\s?\d+/i,
            /\bgalaxy\s?(s\d+|note|a\d+|j\d+)/i,
            /\bredmi\s?(note|\d+)/i,
            /\bmoto\s?g\d+/i,
            /\bcelular\b/i,
            /\bsmartphone\b/i
        ],
        questions: [
            {
                id: 'storage',
                question: 'Qual capacidade de armazenamento?',
                type: 'choice',
                options: [
                    '64GB',
                    '128GB',
                    '256GB',
                    '512GB',
                    '1TB',
                    'Tanto faz'
                ],
                required: false
            },
            {
                id: 'condition',
                question: 'Produto novo ou usado?',
                type: 'choice',
                options: [
                    'Novo',
                    'Usado',
                    'Tanto faz'
                ],
                required: true
            }
        ]
    },
    notebook: {
        name: 'Notebook',
        keywords: [
            'notebook',
            'laptop',
            'macbook'
        ],
        patterns: [
            /\bnotebook\b/i,
            /\blaptop\b/i,
            /\bmacbook\b/i
        ],
        questions: [
            {
                id: 'usage',
                question: 'Para que você vai usar?',
                type: 'choice',
                options: [
                    'Trabalho/Estudos',
                    'Jogos',
                    'Design/Edição',
                    'Uso básico'
                ],
                required: false
            },
            {
                id: 'condition',
                question: 'Produto novo ou usado?',
                type: 'choice',
                options: [
                    'Novo',
                    'Usado',
                    'Tanto faz'
                ],
                required: true
            }
        ]
    },
    eletrodomestico: {
        name: 'Eletrodoméstico',
        keywords: [
            'geladeira',
            'fogao',
            'microondas',
            'secadora',
            'freezer',
            'brastemp',
            'consul',
            'electrolux'
        ],
        patterns: [
            /\bgeladeira\b/i,
            /\bfog[aã]o\b/i,
            /\bmicroondas\b/i,
            /\blava[-\s]?(roupa|louça)/i
        ],
        questions: [
            {
                id: 'brand_preference',
                question: 'Tem preferência de marca?',
                type: 'choice',
                options: [
                    'Brastemp',
                    'Consul',
                    'Electrolux',
                    'LG',
                    'Samsung',
                    'Nenhuma dessas marcas'
                ],
                required: false
            },
            {
                id: 'condition',
                question: 'Produto novo ou usado?',
                type: 'choice',
                options: [
                    'Novo',
                    'Usado',
                    'Tanto faz'
                ],
                required: true
            }
        ]
    },
    movel: {
        name: 'Móvel',
        keywords: [
            'sofa',
            'mesa',
            'cadeira',
            'cama',
            'guarda',
            'armario',
            'estante',
            'poltrona',
            'banco',
            'escrivaninha',
            'rack',
            'comoda',
            'painel',
            'criado',
            'closet'
        ],
        patterns: [
            /\bcadeira\s*(gamer|escritorio|office)/i,
            /\bmesa\s*(gamer|escritorio|jantar)/i,
            /\bsof[aá]\b/i,
            /\bcama\s*(box|solteiro|casal)/i,
            /\brack\s*(tv)?/i,
            /\bpainel\s*(tv)?/i
        ],
        questions: [
            {
                id: 'type',
                question: 'Que tipo específico?',
                type: 'choice',
                options: [
                    'Cadeira gamer',
                    'Cadeira escritório',
                    'Mesa gamer',
                    'Mesa escritório',
                    'Sofá',
                    'Cama',
                    'Outro'
                ],
                required: false
            },
            {
                id: 'condition',
                question: 'Produto novo ou usado?',
                type: 'choice',
                options: [
                    'Novo',
                    'Usado',
                    'Tanto faz'
                ],
                required: true
            }
        ]
    },
    veiculo: {
        name: 'Veículo',
        keywords: [
            'carro',
            'motocicleta',
            'bicicleta',
            'bike',
            'automovel',
            'veiculo',
            'moto'
        ],
        patterns: [
            /\b(carro|automovel|veiculo)\b/i,
            /\b(moto|motocicleta)\b/i,
            /\bbicicleta\b/i,
            /\b(honda|toyota|ford|vw|chevrolet)\s+(civic|corolla|gol|onix|fit|city)/i,
            /\bcarro\s+(honda|toyota|ford|vw|chevrolet)/i,
            /\bmoto\s+(honda|yamaha|suzuki)/i
        ],
        questions: [
            {
                id: 'condition',
                question: 'Produto novo ou usado?',
                type: 'choice',
                options: [
                    'Novo',
                    'Usado',
                    'Tanto faz'
                ],
                required: true
            }
        ]
    },
    eletronico: {
        name: 'Eletrônico',
        keywords: [
            'televisao',
            'monitor',
            'fone',
            'headset',
            'mouse',
            'teclado',
            'camera',
            'playstation',
            'xbox',
            'nintendo',
            'airpods',
            'ipad'
        ],
        patterns: [
            /\b(tv|televisao)\s?\d{2}/i,
            /\bmonitor\s?\d{2}/i,
            /\bfone\s*(ouvido|bluetooth)?/i,
            /\b(playstation|xbox|nintendo)\b/i,
            /\b(airpods|ipad)\b/i,
            /\btv\b/i,
            /\bmonitor\b/i
        ],
        questions: [
            {
                id: 'type',
                question: 'Que tipo de eletrônico?',
                type: 'choice',
                options: [
                    'TV/Monitor',
                    'Fone de ouvido',
                    'Periféricos',
                    'Console/Games',
                    'Outro'
                ],
                required: false
            },
            {
                id: 'condition',
                question: 'Produto novo ou usado?',
                type: 'choice',
                options: [
                    'Novo',
                    'Usado',
                    'Tanto faz'
                ],
                required: true
            }
        ]
    },
    calcado_roupa: {
        name: 'Calçado/Roupa',
        keywords: [
            'tenis',
            'tênis',
            'sapato',
            'bota',
            'sandalia',
            'chinelo',
            'camisa',
            'camiseta',
            'calça',
            'jaqueta',
            'blusa',
            'vestido',
            'saia',
            'shorts',
            'corrida',
            'esporte',
            'cloudrunner',
            'waterproof',
            'running',
            'trail',
            'casual',
            'chuteira',
            'sapatilha'
        ],
        patterns: [
            /\bt[eê]nis\b/i,
            /\bt[eê]nis\s+(de\s+)?(corrida|esporte|caminhada|treino)/i,
            /\bsapato\b/i,
            /\bbota\b/i,
            /\bcamisa\b/i,
            /\bcamiseta\b/i,
            /\bcalça\b/i,
            /\b(cloudrunner|waterproof|running|trail)\b/i,
            /\bchuteira\b/i
        ],
        questions: [
            {
                id: 'condition',
                question: 'Produto novo ou usado?',
                type: 'choice',
                options: [
                    'Novo',
                    'Usado',
                    'Tanto faz'
                ],
                required: true
            },
            {
                id: 'sort_by',
                question: 'Como quer ordenar os resultados?',
                type: 'choice',
                options: [
                    'Mais relevantes',
                    'Menor preço',
                    'Maior preço'
                ],
                required: false
            }
        ]
    },
    generico: {
        name: 'Produto',
        keywords: [],
        patterns: [],
        questions: [
            {
                id: 'condition',
                question: 'Produto novo ou usado?',
                type: 'choice',
                options: [
                    'Novo',
                    'Usado',
                    'Tanto faz'
                ],
                required: true
            }
        ]
    }
};
;
;
// Modelos específicos de produtos (detecção prioritária)
const PRODUCT_MODEL_PATTERNS = {
    calcado_roupa: [
        /\bcloudrunner\s?\d*\b/i,
        /\bcloud\s?runner\s?\d*\b/i,
        /\bultraboost\s?\d*\b/i,
        /\bair\s?max\s?\d*\b/i,
        /\bpegasus\s?\d*\b/i,
        /\brevolution\s?\d*\b/i,
        /\breact\s?\d*\b/i
    ],
    smartphone: [
        /\biphone\s?(1[0-9]|[6-9])(\s?(pro|max|plus|mini))?\b/i,
        /\bgalaxy\s?s\d+(\s?(ultra|plus))?\b/i,
        /\bredmi\s?note\s?\d*\b/i
    ],
    notebook: [
        /\bmacbook(\s?(air|pro))?\b/i,
        /\bthinkpad\b/i,
        /\binspiron\b/i
    ]
};
// Marcas que não devem pontuar sozinhas
const BRAND_ONLY_KEYWORDS = new Set([
    'nike',
    'adidas',
    'puma',
    'olympikus',
    'samsung',
    'lg',
    'brastemp',
    'consul'
]);
// Prioridade das categorias (maior = mais prioritário)
const CATEGORY_PRIORITY = {
    smartphone: 10,
    notebook: 9,
    veiculo: 8,
    calcado_roupa: 7,
    eletronico: 6,
    movel: 5,
    eletrodomestico: 4,
    generico: 1
};
function detectProductCategoryWithRanking(query) {
    // PRIORIDADE 0: Detecta categoria via entity (iPhone, PS5, MacBook)
    const entity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$brandDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectProductEntity"])(query);
    if (entity.category) {
        const categoryMap = {
            'smartphone': 'smartphone',
            'laptop': 'notebook',
            'tablet': 'eletronico',
            'console': 'eletronico'
        };
        const mappedCategory = categoryMap[entity.category];
        if (mappedCategory) {
            console.log('⭐ Entity category detected:', mappedCategory);
            return [
                {
                    category: mappedCategory,
                    score: 100
                }
            ];
        }
    }
    // PRIORIDADE 1: Detecta modelos específicos primeiro
    for (const [category, patterns] of Object.entries(PRODUCT_MODEL_PATTERNS)){
        for (const pattern of patterns){
            if (pattern.test(query)) {
                console.log('⭐ Modelo específico detectado:', category, pattern);
                return [
                    {
                        category,
                        score: 50
                    }
                ];
            }
        }
    }
    const { normalized, tokens } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$advancedNormalizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeAndTokenize"])(query);
    const expandedTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$advancedNormalizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expandWithSynonyms"])(tokens);
    const DEBUG = ("TURBOPACK compile-time value", "development") === 'development';
    if ("TURBOPACK compile-time truthy", 1) {
        console.log('🔍 QUERY:', query);
        console.log('🔍 NORMALIZED:', normalized);
        console.log('🔍 TOKENS:', tokens);
        console.log('🔍 EXPANDED:', expandedTokens);
    }
    // Otimização: Set para O(1) lookup
    const tokenSet = new Set(expandedTokens);
    const scores = [];
    for (const [categoryId, category] of Object.entries(PRODUCT_CATEGORIES)){
        if (categoryId === 'generico') continue;
        let score = 0;
        // Patterns regex (pontuação alta - aumentada para 10)
        for (const pattern of category.patterns){
            if (pattern.test(normalized)) {
                score += 10;
                if ("TURBOPACK compile-time truthy", 1) console.log('✅ Pattern match:', categoryId, '+10 pontos');
                break;
            }
        }
        // Keywords com tokens - limitado
        let keywordMatches = 0;
        let hasBrandOnly = false;
        for (const keyword of category.keywords){
            if (tokenSet.has(keyword)) {
                keywordMatches++;
                // Verifica se é apenas marca sem contexto
                if (BRAND_ONLY_KEYWORDS.has(keyword) && expandedTokens.length === 1) {
                    hasBrandOnly = true;
                }
            }
        }
        // Se é apenas marca, reduz pontuação
        if (hasBrandOnly && keywordMatches === 1) {
            score += 1;
            if ("TURBOPACK compile-time truthy", 1) console.log('⚠️ Brand only:', categoryId, '+1 ponto');
        } else if (keywordMatches >= 2) {
            // Bonus para múltiplos matches
            score += keywordMatches * 4;
            if ("TURBOPACK compile-time truthy", 1) console.log('✅ Keywords match:', categoryId, `+${keywordMatches * 4} pontos`);
        } else if (keywordMatches > 0) {
            score += keywordMatches * 3;
            if ("TURBOPACK compile-time truthy", 1) console.log('✅ Keywords match:', categoryId, `+${keywordMatches * 3} pontos`);
        }
        // Bonus por prioridade
        const priorityBonus = CATEGORY_PRIORITY[categoryId] || 0;
        score += priorityBonus * 0.5;
        if (score > 0) {
            scores.push({
                category: categoryId,
                score
            });
            if ("TURBOPACK compile-time truthy", 1) console.log('🏆 CATEGORY:', categoryId, 'SCORE:', score);
        }
    }
    // Ordena por score e retorna top 3
    const ranking = scores.sort((a, b)=>b.score - a.score).slice(0, 3);
    if ("TURBOPACK compile-time truthy", 1) {
        console.log('🏆 Ranking final:', ranking);
    }
    return ranking;
}
function detectProductCategory(query) {
    const ranking = detectProductCategoryWithRanking(query);
    if (ranking.length === 0) return 'generico';
    // Threshold mínimo de confiança
    if (ranking[0].score < 5) {
        console.log('⚠️ Score muito baixo, usando genérico');
        return 'generico';
    }
    // Se a diferença entre top 1 e top 2 for pequena, há incerteza
    if (ranking.length >= 2 && ranking[0].score - ranking[1].score < 2) {
        console.log('⚠️ Categoria incerta. Top 2:', ranking.slice(0, 2));
    // Por enquanto retorna a melhor, mas poderia perguntar ao usuário
    }
    return ranking[0].category;
}
function isCategoryConfident(query) {
    const ranking = detectProductCategoryWithRanking(query);
    if (ranking.length === 0) return false;
    if (ranking.length === 1) return true;
    // Confiante se diferença > 2 pontos
    return ranking[0].score - ranking[1].score >= 2;
}
function formatCategoryQuestion(question) {
    return question.question;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/smartQuestions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectProvidedInfo",
    ()=>detectProvidedInfo,
    "filterQuestions",
    ()=>filterQuestions,
    "needsGenderQuestion",
    ()=>needsGenderQuestion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$brandDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/brandDetector.ts [app-client] (ecmascript)");
;
function detectProvidedInfo(query) {
    const normalized = query.toLowerCase();
    const provided = {};
    console.log('🔍 Analisando query para informações:', normalized);
    // NÃO detecta condição automaticamente - sempre perguntar
    // Isso evita confusão quando o usuário digita "tenis nike air max 97 novo"
    // e o sistema pula a pergunta de condição
    // Detecta gênero
    if (/\b(masculino|masculina|homem|para homem|men)\b/i.test(normalized)) {
        provided.gender = 'Masculino';
        console.log('✅ Detectou gênero: Masculino');
    } else if (/\b(feminino|feminina|mulher|para mulher|women)\b/i.test(normalized)) {
        provided.gender = 'Feminino';
        console.log('✅ Detectou gênero: Feminino');
    } else if (/\b(unissex|unisex)\b/i.test(normalized)) {
        provided.gender = 'Unissex';
        console.log('✅ Detectou gênero: Unissex');
    }
    // Detecta armazenamento (melhorado)
    const storagePatterns = [
        /\b(\d+)\s*gb\b/i,
        /\b(\d+)gb\b/i,
        /\bde\s+(\d+)\s*gb\b/i
    ];
    for (const pattern of storagePatterns){
        const match = normalized.match(pattern);
        if (match) {
            const size = parseInt(match[1]);
            if (size === 64) provided.storage = '64GB';
            else if (size === 128) provided.storage = '128GB';
            else if (size === 256) provided.storage = '256GB';
            else if (size === 512) provided.storage = '512GB';
            else if (size === 1024 || size === 1) provided.storage = '1TB';
            console.log('✅ Detectou armazenamento:', provided.storage);
            break;
        }
    }
    // Detecta tipo de móvel
    if (/cadeira\s*gamer/i.test(normalized)) {
        provided.type = 'Cadeira gamer';
    } else if (/mesa\s*gamer/i.test(normalized)) {
        provided.type = 'Mesa gamer';
    } else if (/\bsofa\b|\bsofá\b/i.test(normalized)) {
        provided.type = 'Sofá';
    }
    // Detecta material
    if (/\bcouro\b/i.test(normalized)) {
        provided.material = 'Couro';
    } else if (/\btecido\b/i.test(normalized)) {
        provided.material = 'Tecido';
    }
    console.log('📝 Informações detectadas:', provided);
    return provided;
}
function needsGenderQuestion(query) {
    const enrichment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$brandDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["enrichProductQuery"])(query);
    return enrichment.needsGenderQuestion;
}
function filterQuestions(questions, providedInfo) {
    return questions.filter((question)=>!providedInfo[question.id]);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/chat/answerParser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Parser inteligente para respostas de perguntas
__turbopack_context__.s([
    "parseAnswer",
    ()=>parseAnswer
]);
function parseAnswer(answer, options) {
    const normalized = answer.toLowerCase().trim();
    // Tenta número primeiro
    const numberMatch = normalized.match(/^(\\d+)/);
    if (numberMatch) {
        const index = parseInt(numberMatch[1]) - 1;
        if (index >= 0 && index < options.length) {
            return options[index];
        }
    }
    // Tenta match por texto
    for (const option of options){
        const optionLower = option.toLowerCase();
        // Match exato
        if (normalized === optionLower) {
            return option;
        }
        // Match por palavras-chave específicas
        if (optionLower.includes('novo') && normalized.includes('novo')) {
            return option;
        }
        if (optionLower.includes('usado') && normalized.includes('usado')) {
            return option;
        }
        if (optionLower.includes('gamer') && normalized.includes('gamer')) {
            return option;
        }
        if (optionLower.includes('tanto') && normalized.includes('tanto')) {
            return option;
        }
        // Match parcial melhorado (evita falsos matches)
        const optionWords = optionLower.split(' ');
        if (optionWords.some((word)=>normalized === word && word.length > 2)) {
            return option;
        }
    }
    // Fallback: retorna a resposta original
    return answer;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/chat/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/coins.js [app-client] (ecmascript) <export default as Coins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flag.js [app-client] (ecmascript) <export default as Flag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-client] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hash$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hash$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hash.js [app-client] (ecmascript) <export default as Hash>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/smartphone.js [app-client] (ecmascript) <export default as Smartphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$headphones$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Headphones$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/headphones.js [app-client] (ecmascript) <export default as Headphones>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$laptop$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Laptop$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/laptop.js [app-client] (ecmascript) <export default as Laptop>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tv.js [app-client] (ecmascript) <export default as Tv>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shirt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shirt$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shirt.js [app-client] (ecmascript) <export default as Shirt>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$car$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Car$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/car.js [app-client] (ecmascript) <export default as Car>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/features/ProductCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$intentDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/intentDetector.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/contextManager.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$productParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/productParser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$genericProductHandler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/genericProductHandler.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$queryProcessor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/queryProcessor.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$categorySystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/categorySystem.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$smartQuestions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/smartQuestions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$answerParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/answerParser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextChangeDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/chat/contextChangeDetector.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function ChatPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: '1',
            type: 'ai',
            content: 'Olá! Sou a IA da Zavlo.\n\nPosso encontrar o melhor preço para você.\n\nDigite um produto para buscar!',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploadedImage, setUploadedImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [imageFile, setImageFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [detectedProductName, setDetectedProductName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [chatState, setChatState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('idle');
    const [pendingSearch, setPendingSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [categoryAnswers, setCategoryAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [showMoreSuggestions, setShowMoreSuggestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [userCredits, setUserCredits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Sidebar states
    const [sidebarOpen, setSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [chatHistory, setChatHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentChatId, setCurrentChatId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPage.useEffect": ()=>{
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth'
            });
            // Foca no input apenas se nenhum outro input está focado
            setTimeout({
                "ChatPage.useEffect": ()=>{
                    if (document.activeElement?.tagName !== 'INPUT') {
                        inputRef.current?.focus();
                    }
                }
            }["ChatPage.useEffect"], 100);
        }
    }["ChatPage.useEffect"], [
        messages
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPage.useEffect": ()=>{
            loadUserCredits();
            loadChatHistory();
            // Listeners para atualização em tempo real
            const handleUserChanged = {
                "ChatPage.useEffect.handleUserChanged": ()=>loadUserCredits()
            }["ChatPage.useEffect.handleUserChanged"];
            const handleStorageChanged = {
                "ChatPage.useEffect.handleStorageChanged": (e)=>{
                    if (e.key === 'zavlo_user') loadUserCredits();
                }
            }["ChatPage.useEffect.handleStorageChanged"];
            window.addEventListener('userChanged', handleUserChanged);
            window.addEventListener('storage', handleStorageChanged);
            return ({
                "ChatPage.useEffect": ()=>{
                    window.removeEventListener('userChanged', handleUserChanged);
                    window.removeEventListener('storage', handleStorageChanged);
                }
            })["ChatPage.useEffect"];
        }
    }["ChatPage.useEffect"], []);
    // Auto-save chat to history com debounce
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPage.useEffect": ()=>{
            const timeout = setTimeout({
                "ChatPage.useEffect.timeout": ()=>{
                    if (currentChatId && messages.length > 1) {
                        saveChatToHistory();
                    }
                }
            }["ChatPage.useEffect.timeout"], 1000);
            return ({
                "ChatPage.useEffect": ()=>clearTimeout(timeout)
            })["ChatPage.useEffect"];
        }
    }["ChatPage.useEffect"], [
        messages,
        currentChatId
    ]);
    const loadUserCredits = async ()=>{
        try {
            const user = localStorage.getItem('zavlo_user');
            if (!user) return;
            const userData = JSON.parse(user);
            const API_URL = ("TURBOPACK compile-time value", "https://zavlo-ia.onrender.com/api/v1");
            const response = await fetch(`${API_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${userData.token}`
                }
            });
            if (response.ok) {
                const profile = await response.json();
                setUserCredits(profile.credits || 0);
            }
        } catch (error) {
            console.error('Erro ao carregar créditos:', error);
        }
    };
    const loadChatHistory = ()=>{
        try {
            const user = localStorage.getItem('zavlo_user');
            if (!user) return;
            const userData = JSON.parse(user);
            const userId = userData.userId;
            const saved = localStorage.getItem(`zavlo_chat_history_${userId}`);
            if (saved) {
                const history = JSON.parse(saved).map((chat)=>({
                        ...chat,
                        createdAt: new Date(chat.createdAt),
                        updatedAt: new Date(chat.updatedAt),
                        messages: chat.messages.map((m)=>({
                                ...m,
                                timestamp: new Date(m.timestamp)
                            }))
                    }));
                setChatHistory(history);
            }
            // Create new chat ID if none exists
            if (!currentChatId) {
                const newChatId = Date.now().toString();
                setCurrentChatId(newChatId);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    };
    const saveChatToHistory = ()=>{
        setChatHistory((prevHistory)=>{
            try {
                const user = localStorage.getItem('zavlo_user');
                if (!user) return prevHistory;
                const userData = JSON.parse(user);
                const userId = userData.userId;
                // Get title from first user message
                const chatTitle = messages.find((m)=>m.type === 'user')?.content.slice(0, 30) || 'Nova conversa';
                const existingIndex = prevHistory.findIndex((c)=>c.id === currentChatId);
                const chatData = {
                    id: currentChatId,
                    title: chatTitle,
                    messages: messages.slice(-50).map((m)=>m.type === 'products' ? {
                            ...m,
                            products: m.products?.slice(0, 6)
                        } : m),
                    createdAt: existingIndex >= 0 ? prevHistory[existingIndex].createdAt : new Date(),
                    updatedAt: new Date()
                };
                let updatedHistory;
                if (existingIndex >= 0) {
                    updatedHistory = [
                        ...prevHistory
                    ];
                    updatedHistory[existingIndex] = chatData;
                } else {
                    updatedHistory = [
                        chatData,
                        ...prevHistory
                    ];
                }
                localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
                return updatedHistory;
            } catch (error) {
                console.error('Erro ao salvar chat:', error);
                return prevHistory;
            }
        });
    };
    const loadChat = (chatId)=>{
        const chat = chatHistory.find((c)=>c.id === chatId);
        if (chat) {
            setMessages(chat.messages);
            setCurrentChatId(chatId);
            setChatState('idle');
            setPendingSearch(null);
            __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["contextManager"].clear();
        }
    };
    const createNewChat = ()=>{
        const newChatId = Date.now().toString();
        setCurrentChatId(newChatId);
        setMessages([
            {
                id: '1',
                type: 'ai',
                content: 'Olá! Sou a IA da Zavlo.\n\nPosso encontrar o melhor preço para você.\n\nDigite um produto para buscar!',
                timestamp: new Date()
            }
        ]);
        setChatState('idle');
        setPendingSearch(null);
        __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["contextManager"].clear();
    };
    const deleteChat = (chatId, e)=>{
        e.stopPropagation();
        const updatedHistory = chatHistory.filter((c)=>c.id !== chatId);
        setChatHistory(updatedHistory);
        const user = localStorage.getItem('zavlo_user');
        if (user) {
            const userData = JSON.parse(user);
            const userId = userData.userId;
            localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
        }
        if (currentChatId === chatId) {
            createNewChat();
        }
    };
    const handleImageUpload = (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Imagem muito grande. Máximo 5MB');
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = ()=>{
            setUploadedImage(reader.result);
        };
        reader.readAsDataURL(file);
    };
    const handleImageSearch = async ()=>{
        if (!imageFile || loading) return;
        setLoading(true);
        const userMessage = {
            id: crypto.randomUUID(),
            type: 'user',
            content: '[Busca por imagem]',
            timestamp: new Date(),
            imageData: uploadedImage || undefined
        };
        setMessages((prev)=>[
                ...prev,
                userMessage
            ]);
        if (userCredits < 1) {
            setTimeout(()=>{
                const errorMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: 'Créditos insuficientes para busca por imagem!',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        errorMessage
                    ]);
                setLoading(false);
                setUploadedImage(null);
                setImageFile(null);
            }, 500);
            return;
        }
        // ETAPA 1: Dizer que está analisando a imagem
        const analyzingMessage = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: '🔍 Analisando sua imagem...\n\nAguarde enquanto identifico o produto.',
            timestamp: new Date()
        };
        setMessages((prev)=>[
                ...prev,
                analyzingMessage
            ]);
        try {
            const user = localStorage.getItem('zavlo_user');
            if (!user) {
                router.push('/auth');
                return;
            }
            const userData = JSON.parse(user);
            // Usar imageData (base64) diretamente
            const API_URL = ("TURBOPACK compile-time value", "https://zavlo-ia.onrender.com/api/v1");
            const response = await fetch(`${API_URL}/search/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageData: uploadedImage
                })
            });
            if (response.status === 401) {
                localStorage.removeItem('zavlo_user');
                router.push('/auth');
                return;
            }
            if (response.ok) {
                const data = await response.json();
                // Atualizar créditos
                if (typeof data.remainingCredits === 'number') {
                    setUserCredits(data.remainingCredits);
                    const updatedUser = {
                        ...userData,
                        credits: data.remainingCredits
                    };
                    localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event('userChanged'));
                }
                const creditsUsed = data.creditsUsed || 1;
                const remainingCredits = data.remainingCredits ?? userCredits - 1;
                let productName = data.productName || 'Produto não identificado';
                // Limpar prefixos indesejados
                productName = productName.replace(/^Esta imagem mostra uma?\s*/i, '').replace(/^Esta é uma?\s*/i, '').replace(/^Este é um\s*/i, '').trim();
                // ETAPA 2: Informar o produto encontrado e perguntar se deseja buscar
                setTimeout(()=>{
                    // Limpar imagem com animação
                    setUploadedImage(null);
                    setImageFile(null);
                    // Armazenar o nome do produto para uso posterior
                    setDetectedProductName(productName);
                    const confirmationMessage = {
                        id: crypto.randomUUID(),
                        type: 'image_confirmation',
                        content: `✅ Produto identificado!\n\n📦 ${productName}\n\n💳 Já gasto: -${creditsUsed} crédito(s) (identificação)\n💰 Saldo atual: ${remainingCredits} créditos\n\n🔍 Deseja buscar preços? (custará +1 crédito)`,
                        timestamp: new Date(),
                        detectedProduct: productName,
                        creditCost: creditsUsed
                    };
                    setMessages((prev)=>[
                            ...prev,
                            confirmationMessage
                        ]);
                    setChatState('awaiting_image_confirmation');
                    setLoading(false);
                }, 800);
            } else {
                const errorData = await response.json().catch(()=>({}));
                if (errorData.error === 'LIMIT_EXCEEDED') {
                    const errorMessage = {
                        id: crypto.randomUUID(),
                        type: 'ai',
                        content: `🚫 Limite diário atingido!\n\nVocê atingiu o limite de buscas por imagem do seu plano hoje.\n\n📊 Soluções:\n• Aguarde até amanhã para novas buscas\n• Faça upgrade do seu plano\n• Use busca por texto (se disponível)\n\n👆 Acesse Plans no menu para fazer upgrade!`,
                        timestamp: new Date()
                    };
                    setMessages((prev)=>[
                            ...prev,
                            errorMessage
                        ]);
                } else {
                    const errorMessage = {
                        id: crypto.randomUUID(),
                        type: 'ai',
                        content: errorData.message || 'Erro na busca por imagem. Tente novamente.',
                        timestamp: new Date()
                    };
                    setMessages((prev)=>[
                            ...prev,
                            errorMessage
                        ]);
                }
                setUploadedImage(null);
                setImageFile(null);
                setLoading(false);
            }
        } catch (error) {
            console.error('Image search error:', error);
            const errorMessage = {
                id: crypto.randomUUID(),
                type: 'ai',
                content: 'Erro ao processar imagem. Tente novamente.',
                timestamp: new Date()
            };
            setMessages((prev)=>[
                    ...prev,
                    errorMessage
                ]);
            setUploadedImage(null);
            setImageFile(null);
            setLoading(false);
        }
    };
    // Função para iniciar busca após confirmação
    const handleImagePriceSearch = ()=>{
        // Remover mensagem de confirmação
        setMessages((prev)=>{
            const index = prev.findLastIndex((m)=>m.type === 'image_confirmation');
            if (index === -1) return prev;
            return prev.filter((_, i)=>i !== index);
        });
        // Perguntar sobre ordenação
        const sortMessage = {
            id: crypto.randomUUID(),
            type: 'sort_question',
            content: 'Como deseja ordenar os resultados?',
            timestamp: new Date()
        };
        setMessages((prev)=>[
                ...prev,
                sortMessage
            ]);
        setChatState('awaiting_image_sort');
    };
    // Função para executar busca com ordenação
    const executeImageSearch = async (sortBy)=>{
        if (!detectedProductName || loading) return;
        setLoading(true);
        setChatState('searching');
        // Remover mensagem de ordenação
        setMessages((prev)=>prev.filter((m)=>m.type !== 'sort_question'));
        // Mensagem de busca
        const searchingMessage = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: 'searching_animation',
            timestamp: new Date()
        };
        setMessages((prev)=>[
                ...prev,
                searchingMessage
            ]);
        try {
            const user = localStorage.getItem('zavlo_user');
            if (!user) {
                router.push('/auth');
                return;
            }
            const userData = JSON.parse(user);
            const API_URL = ("TURBOPACK compile-time value", "https://zavlo-ia.onrender.com/api/v1");
            // Buscar preços usando o nome do produto já detectado
            const params = new URLSearchParams({
                query: detectedProductName,
                limit: '50',
                sortBy: sortBy
            });
            const response = await fetch(`${API_URL}/search/text?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userData.token}`
                }
            });
            if (response.status === 401) {
                localStorage.removeItem('zavlo_user');
                router.push('/auth');
                return;
            }
            if (response.ok) {
                const data = await response.json();
                const products = data.results || [];
                // Atualizar créditos
                if (typeof data.remainingCredits === 'number') {
                    setUserCredits(data.remainingCredits);
                    const updatedUser = {
                        ...userData,
                        credits: data.remainingCredits
                    };
                    localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event('userChanged'));
                }
                const creditsUsed = data.creditsUsed || 1;
                const remainingCredits = data.remainingCredits ?? userCredits - 1;
                setTimeout(()=>{
                    const productsMessage = {
                        id: crypto.randomUUID(),
                        type: 'products',
                        content: `✅ Encontrei ${products.length} produtos!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}\n\n🔍 Quer buscar outro produto? Digite agora!`,
                        products: products,
                        timestamp: new Date(),
                        creditCost: creditsUsed
                    };
                    setMessages((prev)=>[
                            ...prev,
                            productsMessage
                        ]);
                    setChatState('idle');
                    setDetectedProductName('');
                    setLoading(false);
                }, 1000);
            } else {
                const errorData = await response.json().catch(()=>({}));
                if (errorData.error === 'LIMIT_EXCEEDED') {
                    const errorMessage = {
                        id: crypto.randomUUID(),
                        type: 'ai',
                        content: `🚫 Limite diário atingido!\n\nVocê atingiu o limite de buscas por texto do seu plano hoje.\n\n📊 Soluções:\n• Aguarde até amanhã para novas buscas\n• Faça upgrade do seu plano\n• Use busca por imagem (se disponível)\n\n👆 Acesse Plans no menu para fazer upgrade!`,
                        timestamp: new Date()
                    };
                    setMessages((prev)=>[
                            ...prev,
                            errorMessage
                        ]);
                } else {
                    const errorMessage = {
                        id: crypto.randomUUID(),
                        type: 'ai',
                        content: 'Erro ao buscar preços. Tente novamente.',
                        timestamp: new Date()
                    };
                    setMessages((prev)=>[
                            ...prev,
                            errorMessage
                        ]);
                }
                setChatState('idle');
                setLoading(false);
            }
        } catch (error) {
            console.error('Image price search error:', error);
            const errorMessage = {
                id: crypto.randomUUID(),
                type: 'ai',
                content: 'Erro ao buscar preços. Tente novamente.',
                timestamp: new Date()
            };
            setMessages((prev)=>[
                    ...prev,
                    errorMessage
                ]);
            setChatState('idle');
            setLoading(false);
        }
    };
    // Função para rejeitar a busca de preços
    const handleImageSearchReject = ()=>{
        // Remover mensagem de confirmação
        setMessages((prev)=>{
            const index = prev.findLastIndex((m)=>m.type === 'image_confirmation');
            if (index === -1) return prev;
            return prev.filter((_, i)=>i !== index);
        });
        const goodbyeMessage = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: '🔄 Ok! Quando quiser buscar preços, é só enviar outra imagem.\n\n💡 Dica: Você também pode digitar o nome do produto para buscar!',
            timestamp: new Date()
        };
        setMessages((prev)=>[
                ...prev,
                goodbyeMessage
            ]);
        setChatState('idle');
        setUploadedImage(null);
        setImageFile(null);
        setDetectedProductName('');
        setLoading(false);
    };
    const sendMessage = (text)=>{
        setInput(text);
        inputRef.current?.focus();
    };
    const handleSend = async (messageText, isInternal = false)=>{
        const currentInput = messageText || input;
        if (!currentInput || !String(currentInput).trim() || loading) return;
        // Verificar se está no estado de confirmação de busca por imagem
        if (chatState === 'awaiting_image_confirmation') {
            const lowerInput = currentInput.toLowerCase().trim();
            if (lowerInput === 'sim' || lowerInput === 'sim!' || lowerInput === 'sim, por favor' || lowerInput === 'yes' || lowerInput === 'y' || lowerInput === 's') {
                // Usuário quer buscar preços
                handleImagePriceSearch();
                return;
            } else if (lowerInput === 'não' || lowerInput === 'nao' || lowerInput === 'no' || lowerInput === 'n' || lowerInput === 'nao, obrigado' || lowerInput === 'não, obrigado') {
                // Usuário não quer buscar
                handleImageSearchReject();
                return;
            } else {
                // Resposta inválida, pedir novamente
                const retryMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: '❓ Por favor, responda apenas com "sim" ou "não".\n\n🔍 Deseja buscar preços deste produto?',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        retryMessage
                    ]);
                return;
            }
        }
        const userMessage = {
            id: crypto.randomUUID(),
            type: 'user',
            content: currentInput,
            timestamp: new Date()
        };
        setMessages((prev)=>[
                ...prev,
                userMessage
            ]);
        setInput('');
        setLoading(true);
        // NOVO: Detecta mudança de contexto APENAS quando idle E sem busca pendente
        if (!isInternal && chatState === 'idle' && !pendingSearch) {
            const contextChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextChangeDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectContextChange"])(currentInput, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["contextManager"].get().conversationHistory);
            // Se usuário corrigiu/mudou de ideia, resetar estado e processar nova busca
            if (contextChange.hasChange && (contextChange.type === 'correction' || contextChange.type === 'new_search')) {
                console.log('🔄 Mudança de contexto detectada:', contextChange);
                // Resetar estado
                setChatState('idle');
                setPendingSearch(null);
                setCategoryAnswers({});
                __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["contextManager"].clear();
                // Construir nova query com as informações extraídas
                const parts = [];
                if (contextChange.newProduct) parts.push(contextChange.newProduct);
                if (contextChange.newBrand) parts.push(contextChange.newBrand);
                if (contextChange.newCondition) parts.push(contextChange.newCondition);
                if (contextChange.newLocation) parts.push(contextChange.newLocation);
                const newQuery = parts.join(' ').trim() || currentInput;
                // Mensagem de confirmação da mudança
                const confirmMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: `🔄 Entendi! Você quer buscar: "${newQuery}"\n\nVou processar essa nova busca...`,
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        confirmMessage
                    ]);
                // Processar como nova busca após um delay (com flag internal)
                setTimeout(()=>{
                    setLoading(false);
                    handleSend(newQuery, true);
                }, 800);
                return;
            }
        }
        // Estado: aguardando localização
        if (chatState === 'awaiting_location') {
            const location = currentInput.toLowerCase().trim();
            const updatedLocation = location === 'não' || location === 'nao' ? undefined : currentInput;
            setPendingSearch((prev)=>{
                if (!prev) return prev;
                return {
                    ...prev,
                    location: updatedLocation
                };
            });
            // Se tem categoria, gerar busca final com respostas
            if (pendingSearch?.category) {
                const allAnswers = {
                    ...categoryAnswers
                };
                console.log('📝 Respostas coletadas:', allAnswers);
                console.log('🗺️ Localização:', updatedLocation);
                const searchResult = buildCategoryQuery(pendingSearch.query, allAnswers, updatedLocation);
                console.log('🔍 Query final gerada:', searchResult);
                const confirmationMessage = {
                    id: crypto.randomUUID(),
                    type: 'confirmation',
                    content: searchResult.query,
                    timestamp: new Date(),
                    searchType: 'text',
                    creditCost: 1
                };
                setMessages((prev)=>[
                        ...prev,
                        confirmationMessage
                    ]);
                setChatState('awaiting_confirmation');
                setLoading(false);
                return;
            }
            // Senão, perguntar condição
            const aiMessage = {
                id: crypto.randomUUID(),
                type: 'ai',
                content: 'Produto novo ou usado?',
                timestamp: new Date()
            };
            setMessages((prev)=>[
                    ...prev,
                    aiMessage
                ]);
            setChatState('awaiting_condition');
            setLoading(false);
            return;
        }
        // Estado: respondendo perguntas de categoria
        if (chatState === 'category_questions') {
            if (!pendingSearch?.category) {
                setLoading(false);
                return;
            }
            const categoryData = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$categorySystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRODUCT_CATEGORIES"][pendingSearch.category];
            const providedInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$smartQuestions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectProvidedInfo"])(pendingSearch.query);
            const remainingQuestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$smartQuestions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterQuestions"])(categoryData.questions, {
                ...categoryAnswers,
                ...providedInfo
            });
            console.log('📋 Perguntas restantes:', remainingQuestions.map((q)=>q.id));
            const currentQuestion = remainingQuestions[0];
            if (!currentQuestion) {
                console.log('⚠️ Pergunta não encontrada!');
                setLoading(false);
                return;
            }
            console.log('📋 Pergunta atual:', currentQuestion);
            console.log('📋 ID da pergunta:', currentQuestion.id);
            console.log('📋 Resposta do usuário:', currentInput);
            // Parse da resposta (aceita número ou texto)
            const parsedAnswer = currentQuestion.options ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$answerParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseAnswer"])(currentInput, currentQuestion.options) : currentInput;
            console.log(`📝 Salvando resposta para ${currentQuestion.id}:`, parsedAnswer);
            // Salva resposta
            const newAnswers = {
                ...categoryAnswers,
                [currentQuestion.id]: parsedAnswer
            };
            setCategoryAnswers(newAnswers);
            console.log('📋 Todas as respostas até agora:', newAnswers);
            // Próxima pergunta
            if (1 < remainingQuestions.length) {
                const nextQuestion = remainingQuestions[1];
                console.log('➡️ Próxima pergunta:', nextQuestion.id);
                const questionMessage = {
                    id: crypto.randomUUID(),
                    type: 'category_question',
                    content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$categorySystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCategoryQuestion"])(nextQuestion),
                    timestamp: new Date(),
                    categoryQuestion: {
                        id: nextQuestion.id,
                        options: nextQuestion.options || [],
                        category: pendingSearch.category
                    }
                };
                setMessages((prev)=>[
                        ...prev,
                        questionMessage
                    ]);
                setLoading(false);
                return;
            } else {
                // Todas as perguntas respondidas, perguntar localização
                console.log('✅ Todas as perguntas de categoria respondidas');
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: 'location_question',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setChatState('awaiting_location');
                setLoading(false);
                return;
            }
        }
        // Estado: aguardando condição
        if (chatState === 'awaiting_condition') {
            const condition = currentInput.toLowerCase().trim();
            setPendingSearch((prev)=>{
                if (!prev) return prev;
                return {
                    ...prev,
                    condition
                };
            });
            const searchResult = buildFinalQuery();
            const confirmationMessage = {
                id: crypto.randomUUID(),
                type: 'confirmation',
                content: searchResult.query,
                timestamp: new Date(),
                searchType: 'text',
                creditCost: 1
            };
            setMessages((prev)=>[
                    ...prev,
                    confirmationMessage
                ]);
            setChatState('awaiting_confirmation');
            setLoading(false);
            return;
        }
        // Verificar créditos ANTES de processar
        if (userCredits < 1) {
            setTimeout(()=>{
                const errorMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: '💳 Créditos insuficientes!\n\nVocê precisa de pelo menos 1 crédito para fazer buscas.\n\n📊 Nossos Planos:\n• Básico: R$ 9,90/mês (50 buscas)\n• Pro: R$ 19,90/mês (150 buscas)\n• Premium: R$ 39,90/mês (ilimitadas)\n\n👆 Acesse Plans no menu para assinar!',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        errorMessage
                    ]);
                setLoading(false);
            }, 500);
            return;
        }
        // Pipeline NLP
        setTimeout(()=>{
            // 1. Limpar query (remove "estou querendo", "preciso de", etc.)
            const cleaned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$queryProcessor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cleanProductQuery"])(currentInput);
            // 2. Aplicar contexto
            const withContext = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["contextManager"].applyContext(cleaned);
            // 3. Detectar intenção
            const intent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$intentDetector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectIntent"])(withContext);
            // IMPORTANTE: Tratar comandos ANTES de processar como produto
            // Tratar saudações
            if (intent.type === 'greeting') {
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: 'Olá! 👋\n\nSou especialista em encontrar os melhores preços!\n\nQue produto você procura hoje?',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // Tratar conversas casuais (tudo bem, como vai, etc)
            if (intent.type === 'question' && /^(tudo bem|como vai|e ai|beleza|oi tudo bem|tá tudo bem)/i.test(currentInput.toLowerCase().trim())) {
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: 'Tudo ótimo! 😊\n\nEstou aqui para te ajudar a encontrar os melhores preços.\n\nQue produto você está procurando?',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // Tratar despedidas
            if (intent.type === 'despedida') {
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: 'Até mais! 👋\n\nVolte sempre que precisar buscar produtos!',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // Perguntas sobre créditos
            if (intent.type === 'credits_question') {
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: `💰 Seus Créditos: ${userCredits}\n\n📊 Custos por busca:\n• Busca por texto: 1 crédito\n• Busca por imagem: 2 créditos\n  └ 1 crédito (identificação)\n  └ 1 crédito (busca de preços)\n\n✨ Vantagens:\n• Créditos não expiram\n• Resultados ilimitados por busca\n• Sem taxas extras\n\n${userCredits < 5 ? '⚠️ Poucos créditos restantes!\n' : ''}💡 Precisa de mais? Confira nossos planos!`,
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // Perguntas sobre planos
            if (intent.type === 'plans_question') {
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: '📊 Nossos Planos:\n\n🌱 Básico - R$ 9,90/mês\n• 50 buscas mensais\n• Suporte por email\n\n🚀 Pro - R$ 19,90/mês\n• 150 buscas mensais\n• Suporte prioritário\n• Alertas de preço\n\n👑 Premium - R$ 39,90/mês\n• Buscas ilimitadas\n• Suporte 24/7\n• Alertas avançados\n• API access\n\n👆 Acesse Plans no menu para assinar!',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // Perguntas sobre a plataforma
            if (intent.type === 'platform_question') {
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: '🤖 Sobre a Zavlo.ia:\n\nSou uma IA especializada em encontrar os melhores preços do Brasil!\n\n🔍 O que faço:\n• Busco em 9+ marketplaces\n• Comparo preços automaticamente\n• Encontro ofertas exclusivas\n• Filtro por localização\n\n🎯 Marketplaces:\nOLX, Mercado Livre, Amazon, Shopee, KaBuM, Enjoei e mais!\n\n💡 Digite um produto para começar!',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // Ajuda
            if (intent.type === 'help') {
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: '❓ Como usar a Zavlo:\n\n🔄 Processo:\n1️⃣ Digite o produto (ex: "iPhone 15")\n2️⃣ Escolha localização (opcional)\n3️⃣ Escolha novo ou usado\n4️⃣ Confirme a busca\n\n💡 Dicas para melhores resultados:\n• Seja específico: "notebook gamer i7 16gb"\n• Use marcas: "tênis nike air max 90"\n• Inclua detalhes: "geladeira frost free 2 portas"\n\n🤖 Comandos úteis:\n• "meus créditos" - Ver saldo\n• "planos" - Ver assinaturas\n• "ajuda" - Este menu',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // Tratar perguntas gerais
            if (intent.type === 'question') {
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: '❓ Como posso ajudar:\n\n🔍 Para buscar produtos:\n• Digite: "iPhone 15", "notebook gamer"\n• Comparo preços de 9+ sites\n\n💬 Perguntas frequentes:\n• "meus créditos" - Ver saldo\n• "planos" - Ver assinaturas\n• "como funciona" - Sobre a Zavlo\n• "ajuda" - Comandos completos\n\n🎯 O que você procura?',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // Se não for busca de produto, avisar
            if (intent.type !== 'search' && intent.type !== 'buy') {
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: '🤔 Não entendi...\n\nTente:\n• "iPhone 15 Pro"\n• "notebook gamer"\n• "tênis nike"\n• "meus créditos"\n• "planos"\n• "ajuda"',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // 4. Parse do produto
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$productParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseProductQuery"])(withContext);
            console.log('🔍 Pipeline NLP:', {
                original: currentInput,
                cleaned,
                withContext,
                intent,
                parsed
            });
            // 5. Verificar se é genérico
            if (parsed.isGeneric) {
                const genericMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$genericProductHandler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["handleGenericProduct"])(parsed.product);
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: genericMessage,
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setLoading(false);
                return;
            }
            // 6. Detectar categoria e iniciar perguntas inteligentes
            const detectedCategory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$categorySystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectProductCategory"])(withContext);
            // Debug crítico
            console.log('🔎 Categoria detectada:', detectedCategory);
            console.log('📦 Existe no catálogo?', !!__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$categorySystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRODUCT_CATEGORIES"][detectedCategory]);
            console.log('📦 Categorias disponíveis:', Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$categorySystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRODUCT_CATEGORIES"]));
            // Fallback seguro
            const category = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$categorySystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRODUCT_CATEGORIES"][detectedCategory] ? detectedCategory : 'generico';
            const categoryData = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$categorySystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRODUCT_CATEGORIES"][category];
            console.log('✅ Categoria final:', category, '📊 Nome:', categoryData.name);
            if (categoryData && categoryData.questions.length > 0) {
                // Detecta informações já fornecidas
                const providedInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$smartQuestions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectProvidedInfo"])(withContext);
                console.log('📝 Informações já fornecidas:', providedInfo);
                // Filtra perguntas já respondidas
                const remainingQuestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$smartQuestions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterQuestions"])(categoryData.questions, providedInfo);
                if (remainingQuestions.length === 0) {
                    // Todas as perguntas já foram respondidas, perguntar localização
                    setPendingSearch({
                        query: cleaned,
                        category
                    });
                    setCategoryAnswers(providedInfo);
                    const aiMessage = {
                        id: crypto.randomUUID(),
                        type: 'ai',
                        content: 'location_question',
                        timestamp: new Date()
                    };
                    setMessages((prev)=>[
                            ...prev,
                            aiMessage
                        ]);
                    setChatState('awaiting_location');
                    setLoading(false);
                    return;
                }
                setPendingSearch({
                    query: cleaned,
                    category
                });
                setCategoryAnswers(providedInfo);
                const firstQuestion = remainingQuestions[0];
                const questionMessage = {
                    id: crypto.randomUUID(),
                    type: 'category_question',
                    content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$categorySystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCategoryQuestion"])(firstQuestion),
                    timestamp: new Date(),
                    categoryQuestion: {
                        id: firstQuestion.id,
                        options: firstQuestion.options || [],
                        category
                    }
                };
                setMessages((prev)=>[
                        ...prev,
                        questionMessage
                    ]);
                setChatState('category_questions');
                setLoading(false);
                return;
            }
            // 6. Verificar se precisa de localização
            if (parsed.needsLocation) {
                setPendingSearch((prev)=>{
                    if (!prev) return {
                        query: cleaned
                    };
                    return {
                        ...prev,
                        query: cleaned
                    };
                });
                const aiMessage = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: 'location_question',
                    timestamp: new Date()
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMessage
                    ]);
                setChatState('awaiting_location');
                setLoading(false);
                return;
            }
            // 7. Verificar se já tem condição ou pedir condição
            if (parsed.condition) {
                // Já tem condição, vai direto para confirmação
                setPendingSearch((prev)=>{
                    if (!prev) return {
                        query: cleaned,
                        condition: parsed.condition
                    };
                    return {
                        ...prev,
                        query: cleaned,
                        condition: parsed.condition
                    };
                });
                const searchResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$productParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildSearchQuery"])(parsed, parsed.condition);
                const confirmationMessage = {
                    id: crypto.randomUUID(),
                    type: 'confirmation',
                    content: searchResult.query,
                    timestamp: new Date(),
                    searchType: 'text',
                    creditCost: 1
                };
                setMessages((prev)=>[
                        ...prev,
                        confirmationMessage
                    ]);
                setChatState('awaiting_confirmation');
                setLoading(false);
                return;
            }
            // 8. Pedir condição
            setPendingSearch((prev)=>{
                if (!prev) return {
                    query: cleaned
                };
                return {
                    ...prev,
                    query: cleaned
                };
            });
            const aiMessage = {
                id: crypto.randomUUID(),
                type: 'ai',
                content: 'Produto novo ou usado?',
                timestamp: new Date()
            };
            setMessages((prev)=>[
                    ...prev,
                    aiMessage
                ]);
            setChatState('awaiting_condition');
            setLoading(false);
        }, 500);
    };
    const buildFinalQuery = ()=>{
        if (!pendingSearch) return {
            query: '',
            sortBy: 'RELEVANCE'
        };
        // Extrai priceMax, storage e sortBy com optional chaining
        const priceMax = categoryAnswers?.price_max;
        const storage = categoryAnswers?.storage;
        const sortBy = categoryAnswers?.sort_by;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$productParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildSearchQuery"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$productParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseProductQuery"])(pendingSearch.query), pendingSearch.condition, pendingSearch.location, undefined, priceMax, storage, sortBy);
    };
    const buildCategoryQuery = (baseQuery, answers, location)=>{
        // Parse do produto
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$productParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseProductQuery"])(baseQuery);
        // Extrai dados das respostas
        const condition = answers?.condition;
        const priceMax = answers?.price_max;
        const storage = answers?.storage;
        const gender = answers?.gender;
        const sortBy = answers?.sort_by;
        console.log('💰 buildCategoryQuery - Dados:', {
            baseQuery,
            answers,
            condition,
            priceMax,
            storage,
            gender,
            location,
            sortBy
        });
        // Usa buildSearchQuery com Google Query Builder
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$productParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildSearchQuery"])(parsed, condition, location, gender, priceMax, storage, sortBy);
        console.log('🎯 Query final gerada:', result);
        return result;
    };
    const handleConfirmSearch = async ()=>{
        if (!pendingSearch || chatState !== 'awaiting_confirmation') return;
        const searchParams = buildFinalQuery();
        setMessages((prev)=>{
            const index = prev.findLastIndex((m)=>m.type === 'confirmation');
            if (index === -1) return prev;
            return prev.filter((_, i)=>i !== index);
        });
        setChatState('searching');
        const searchingMessage = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: 'searching_animation',
            timestamp: new Date()
        };
        setMessages((prev)=>[
                ...prev,
                searchingMessage
            ]);
        try {
            const user = localStorage.getItem('zavlo_user');
            if (!user) {
                router.push('/auth');
                return;
            }
            const userData = JSON.parse(user);
            const API_URL = ("TURBOPACK compile-time value", "https://zavlo-ia.onrender.com/api/v1");
            // Construir URL com parâmetros
            const params = new URLSearchParams({
                query: searchParams.query,
                limit: '50',
                sortBy: searchParams.sortBy
            });
            if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice.toString());
            if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice.toString());
            const response = await fetch(`${API_URL}/search/text?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userData.token}`
                }
            });
            if (response.status === 401) {
                localStorage.removeItem('zavlo_user');
                router.push('/auth');
                return;
            }
            if (response.ok) {
                const data = await response.json();
                const products = data.results || [];
                if (products.length === 0) {
                    const errorMessage = {
                        id: crypto.randomUUID(),
                        type: 'ai',
                        content: `❌ Nenhum produto encontrado para "${searchParams.query}".\n\n💡 Tente:\n• Ser mais específico\n• Usar sinônimos\n• Remover filtros\n\n🔍 Digite outro produto para buscar!`,
                        timestamp: new Date()
                    };
                    setMessages((prev)=>[
                            ...prev,
                            errorMessage
                        ]);
                    setChatState('idle');
                    setPendingSearch(null);
                    return;
                }
                if (typeof data.remainingCredits === 'number') {
                    setUserCredits(data.remainingCredits);
                    const updatedUser = {
                        ...userData,
                        credits: data.remainingCredits
                    };
                    localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event('userChanged'));
                }
                const creditsUsed = data.creditsUsed || 1;
                const remainingCredits = data.remainingCredits ?? userCredits - 1;
                setTimeout(()=>{
                    const productsMessage = {
                        id: crypto.randomUUID(),
                        type: 'products',
                        content: `✅ Encontrei ${products.length} produtos!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}\n\n🔍 Quer buscar outro produto? Digite agora!`,
                        products: products,
                        timestamp: new Date()
                    };
                    setMessages((prev)=>[
                            ...prev,
                            productsMessage
                        ]);
                    // Atualiza contexto com resultados - usa parsed.product ao invés de split
                    const parsedFinal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$productParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseProductQuery"])(searchParams.query);
                    __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$chat$2f$contextManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["contextManager"].update({
                        lastResults: products,
                        lastProduct: parsedFinal.product
                    });
                    setChatState('idle');
                    setPendingSearch(null);
                }, 1000);
            } else {
                const errorData = await response.json().catch(()=>({}));
                if (errorData.error === 'LIMIT_EXCEEDED') {
                    const errorMessage = {
                        id: crypto.randomUUID(),
                        type: 'ai',
                        content: `🚫 Limite diário atingido!\n\nVocê atingiu o limite de buscas por texto do seu plano hoje.\n\n📊 Soluções:\n• Aguarde até amanhã para novas buscas\n• Faça upgrade do seu plano\n• Use busca por imagem (se disponível)\n\n👆 Acesse Plans no menu para fazer upgrade!`,
                        timestamp: new Date()
                    };
                    setMessages((prev)=>[
                            ...prev,
                            errorMessage
                        ]);
                } else {
                    const errorMessage = {
                        id: crypto.randomUUID(),
                        type: 'ai',
                        content: 'Erro na busca. Tente novamente.',
                        timestamp: new Date()
                    };
                    setMessages((prev)=>[
                            ...prev,
                            errorMessage
                        ]);
                }
                setChatState('idle');
                setPendingSearch(null);
            }
        } catch (error) {
            console.error('Search error:', error);
            const errorMessage = {
                id: crypto.randomUUID(),
                type: 'ai',
                content: 'Ops! Algo deu errado. Tente novamente.',
                timestamp: new Date()
            };
            setMessages((prev)=>[
                    ...prev,
                    errorMessage
                ]);
            setChatState('idle');
            setPendingSearch(null);
        }
    };
    const handleCancelSearch = ()=>{
        setMessages((prev)=>{
            const index = prev.findLastIndex((m)=>m.type === 'confirmation');
            if (index === -1) return prev;
            return prev.filter((_, i)=>i !== index);
        });
        setChatState('idle');
        setPendingSearch(null);
        const cancelMessage = {
            id: crypto.randomUUID(),
            type: 'ai',
            content: '🔄 Vejo que você cancelou a busca!\n\n💡 Dica: Digite o produto com o máximo de detalhes possíveis para melhores resultados.\n\nExemplos:\n• "iPhone 13 Pro 256GB"\n• "Tênis Nike Air Max 270 preto"\n• "Notebook Gamer i7 16GB RTX"',
            timestamp: new Date()
        };
        setMessages((prev)=>[
                ...prev,
                cancelMessage
            ]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen bg-gradient-to-br from-[#0A0A0F] via-[#0F0F14] to-[#0A0A0F] flex",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].aside, {
                    initial: {
                        x: -280,
                        opacity: 0
                    },
                    animate: {
                        x: 0,
                        opacity: 1
                    },
                    exit: {
                        x: -280,
                        opacity: 0
                    },
                    transition: {
                        duration: 0.3,
                        ease: [
                            0.4,
                            0,
                            0.2,
                            1
                        ]
                    },
                    className: "w-72 h-full border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col fixed md:relative z-50",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 border-b border-white/5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                onClick: createNewChat,
                                whileHover: {
                                    scale: 1.02
                                },
                                whileTap: {
                                    scale: 0.98
                                },
                                className: "w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-white/10 rounded-2xl text-white transition-all text-sm font-medium shadow-lg shadow-blue-500/5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1331,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Nova conversa"
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1332,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/chat/page.tsx",
                                lineNumber: 1325,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/chat/page.tsx",
                            lineNumber: 1324,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 overflow-y-auto px-3 py-2",
                            children: chatHistory.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-16 px-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-12 h-12 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                            className: "w-6 h-6 text-gray-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 1341,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1340,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500",
                                        children: "Nenhuma conversa ainda"
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1343,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/chat/page.tsx",
                                lineNumber: 1339,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: chatHistory.map((chat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            x: -10
                                        },
                                        animate: {
                                            opacity: 1,
                                            x: 0
                                        },
                                        whileHover: {
                                            x: 2
                                        },
                                        className: `group relative p-3 rounded-xl transition-all cursor-pointer ${currentChatId === chat.id ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'}`,
                                        onClick: ()=>loadChat(chat.id),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${currentChatId === chat.id ? 'bg-blue-400' : 'bg-gray-600'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1361,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-gray-300 truncate flex-1 pr-8",
                                                    children: chat.title
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1364,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: (e)=>deleteChat(chat.id, e),
                                                    className: "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-500/20 rounded-lg transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                                                    "aria-label": "Deletar conversa",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                        className: "w-3.5 h-3.5 text-gray-500 hover:text-red-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1370,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1365,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 1360,
                                            columnNumber: 23
                                        }, this)
                                    }, chat.id, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1348,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/chat/page.tsx",
                                lineNumber: 1346,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/chat/page.tsx",
                            lineNumber: 1337,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 border-t border-white/5 md:hidden",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSidebarOpen(false),
                                className: "w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 text-sm transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1385,
                                        columnNumber: 17
                                    }, this),
                                    "Fechar"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/chat/page.tsx",
                                lineNumber: 1381,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/chat/page.tsx",
                            lineNumber: 1380,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/chat/page.tsx",
                    lineNumber: 1316,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/chat/page.tsx",
                lineNumber: 1314,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden",
                    onClick: ()=>setSidebarOpen(false)
                }, void 0, false, {
                    fileName: "[project]/app/chat/page.tsx",
                    lineNumber: 1396,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/chat/page.tsx",
                lineNumber: 1394,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col h-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-b border-white/5 bg-black/20 backdrop-blur-2xl px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 sm:gap-4 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                        onClick: ()=>setSidebarOpen(!sidebarOpen),
                                        whileHover: {
                                            scale: 1.05
                                        },
                                        whileTap: {
                                            scale: 0.95
                                        },
                                        className: "p-2 hover:bg-white/10 rounded-xl flex-shrink-0 transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                            className: "w-5 h-5 text-gray-400"
                                        }, void 0, false, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 1417,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1411,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: "/assets/icons/logo.ico",
                                                alt: "Zavlo AI",
                                                width: 36,
                                                height: 36,
                                                className: "rounded-2xl flex-shrink-0 shadow-lg shadow-purple-500/20"
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/page.tsx",
                                                lineNumber: 1420,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                        className: "text-sm font-semibold text-white truncate",
                                                        children: "Zavlo AI"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1428,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-500 hidden sm:block",
                                                        children: "Assistente de Compras"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1429,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/chat/page.tsx",
                                                lineNumber: 1427,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1419,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/chat/page.tsx",
                                lineNumber: 1410,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 sm:gap-3 flex-shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        whileHover: {
                                            scale: 1.05
                                        },
                                        className: "flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl shadow-lg shadow-yellow-500/5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                                className: "w-4 h-4 text-yellow-400"
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/page.tsx",
                                                lineNumber: 1438,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-semibold text-white",
                                                children: userCredits
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/page.tsx",
                                                lineNumber: 1439,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1434,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                        onClick: ()=>router.push('/'),
                                        whileHover: {
                                            scale: 1.05
                                        },
                                        whileTap: {
                                            scale: 0.95
                                        },
                                        className: "p-2 hover:bg-white/10 rounded-xl transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-5 h-5 text-gray-400"
                                        }, void 0, false, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 1447,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 1441,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/chat/page.tsx",
                                lineNumber: 1433,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/chat/page.tsx",
                        lineNumber: 1409,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-4xl mx-auto space-y-3 sm:space-y-4",
                            children: [
                                messages.length === 1 && messages[0].type === 'ai' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-center gap-3 sm:gap-4 mt-4 sm:mt-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                    className: "w-4 h-4 text-purple-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1458,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm sm:text-base font-semibold text-white",
                                                    children: "Sugestões Rápidas"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1459,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 1457,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-2 w-full max-w-2xl",
                                            children: [
                                                {
                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__["Smartphone"], {
                                                        className: "w-4 h-4 sm:w-5 sm:h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1465,
                                                        columnNumber: 29
                                                    }, this),
                                                    text: 'iPhone 15 Pro',
                                                    color: 'from-blue-500/20 to-purple-500/20 border-blue-500/30'
                                                },
                                                {
                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$headphones$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Headphones$3e$__["Headphones"], {
                                                        className: "w-4 h-4 sm:w-5 sm:h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1466,
                                                        columnNumber: 29
                                                    }, this),
                                                    text: 'Fone até R$ 200',
                                                    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
                                                },
                                                {
                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$laptop$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Laptop$3e$__["Laptop"], {
                                                        className: "w-4 h-4 sm:w-5 sm:h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1467,
                                                        columnNumber: 29
                                                    }, this),
                                                    text: 'Notebook Gamer',
                                                    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
                                                },
                                                {
                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__["Tv"], {
                                                        className: "w-4 h-4 sm:w-5 sm:h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1468,
                                                        columnNumber: 29
                                                    }, this),
                                                    text: 'Smart TV 50"',
                                                    color: 'from-orange-500/20 to-red-500/20 border-orange-500/30'
                                                }
                                            ].map((suggestion, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                    whileHover: {
                                                        scale: 1.02
                                                    },
                                                    whileTap: {
                                                        scale: 0.98
                                                    },
                                                    onClick: ()=>{
                                                        setShowMoreSuggestions(false);
                                                        setInput(suggestion.text);
                                                        inputRef.current?.focus();
                                                    },
                                                    className: `flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-3.5 bg-gradient-to-br ${suggestion.color} border rounded-xl text-white transition-all hover:shadow-lg`,
                                                    children: [
                                                        suggestion.icon,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "truncate text-sm sm:text-base font-medium",
                                                            children: suggestion.text
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/chat/page.tsx",
                                                            lineNumber: 1482,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1470,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 1463,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full max-w-2xl",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                    whileHover: {
                                                        scale: 1.01
                                                    },
                                                    whileTap: {
                                                        scale: 0.99
                                                    },
                                                    onClick: ()=>setShowMoreSuggestions(!showMoreSuggestions),
                                                    className: "w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm sm:text-base font-medium",
                                                            children: "Mais sugestões"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/chat/page.tsx",
                                                            lineNumber: 1495,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                            animate: {
                                                                rotate: showMoreSuggestions ? 180 : 0
                                                            },
                                                            transition: {
                                                                duration: 0.2
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                className: "w-5 h-5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1500,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/chat/page.tsx",
                                                            lineNumber: 1496,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1489,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                    children: showMoreSuggestions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        initial: {
                                                            height: 0,
                                                            opacity: 0
                                                        },
                                                        animate: {
                                                            height: 'auto',
                                                            opacity: 1
                                                        },
                                                        exit: {
                                                            height: 0,
                                                            opacity: 0
                                                        },
                                                        transition: {
                                                            duration: 0.3
                                                        },
                                                        className: "overflow-hidden",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mt-3 space-y-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white/5 border border-white/10 rounded-xl p-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-2 mb-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                                    className: "w-5 h-5 text-yellow-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1517,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                    className: "text-sm font-semibold text-gray-300",
                                                                                    children: "Eletrônicos"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1518,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1516,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-2 gap-2",
                                                                            children: [
                                                                                {
                                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__["Smartphone"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1522,
                                                                                        columnNumber: 41
                                                                                    }, this),
                                                                                    text: 'Samsung Galaxy S24'
                                                                                },
                                                                                {
                                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$laptop$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Laptop$3e$__["Laptop"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1523,
                                                                                        columnNumber: 41
                                                                                    }, this),
                                                                                    text: 'MacBook Air M2'
                                                                                },
                                                                                {
                                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$headphones$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Headphones$3e$__["Headphones"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1524,
                                                                                        columnNumber: 41
                                                                                    }, this),
                                                                                    text: 'AirPods Pro'
                                                                                },
                                                                                {
                                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__["Tv"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1525,
                                                                                        columnNumber: 41
                                                                                    }, this),
                                                                                    text: 'PS5 Digital'
                                                                                }
                                                                            ].map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>{
                                                                                        setInput(item.text);
                                                                                        setShowMoreSuggestions(false);
                                                                                        inputRef.current?.focus();
                                                                                    },
                                                                                    className: "flex items-center gap-2 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-left",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex-shrink-0",
                                                                                            children: item.icon
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 1532,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-xs sm:text-sm truncate",
                                                                                            children: item.text
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 1533,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    ]
                                                                                }, i, true, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1527,
                                                                                    columnNumber: 33
                                                                                }, this))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1520,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                    lineNumber: 1515,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white/5 border border-white/10 rounded-xl p-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-2 mb-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shirt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shirt$3e$__["Shirt"], {
                                                                                    className: "w-5 h-5 text-pink-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1542,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                    className: "text-sm font-semibold text-gray-300",
                                                                                    children: "Moda"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1543,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1541,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-2 gap-2",
                                                                            children: [
                                                                                {
                                                                                    text: 'Tênis Nike Air Max'
                                                                                },
                                                                                {
                                                                                    text: 'Jaqueta de couro'
                                                                                },
                                                                                {
                                                                                    text: 'Relógio Casio'
                                                                                },
                                                                                {
                                                                                    text: 'Óculos Ray-Ban'
                                                                                }
                                                                            ].map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>{
                                                                                        setInput(item.text);
                                                                                        setShowMoreSuggestions(false);
                                                                                        inputRef.current?.focus();
                                                                                    },
                                                                                    className: "flex items-center gap-2 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-left",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shirt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shirt$3e$__["Shirt"], {
                                                                                            className: "w-4 h-4 flex-shrink-0"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 1557,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-xs sm:text-sm truncate",
                                                                                            children: item.text
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 1558,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    ]
                                                                                }, i, true, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1552,
                                                                                    columnNumber: 33
                                                                                }, this))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1545,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                    lineNumber: 1540,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white/5 border border-white/10 rounded-xl p-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-2 mb-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$car$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Car$3e$__["Car"], {
                                                                                    className: "w-5 h-5 text-blue-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1567,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                    className: "text-sm font-semibold text-gray-300",
                                                                                    children: "Veículos"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1568,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1566,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-2 gap-2",
                                                                            children: [
                                                                                {
                                                                                    text: 'Honda Civic 2020'
                                                                                },
                                                                                {
                                                                                    text: 'Moto Honda CG'
                                                                                },
                                                                                {
                                                                                    text: 'Corolla 2019'
                                                                                },
                                                                                {
                                                                                    text: 'Gol G7'
                                                                                }
                                                                            ].map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>{
                                                                                        setInput(item.text);
                                                                                        setShowMoreSuggestions(false);
                                                                                        inputRef.current?.focus();
                                                                                    },
                                                                                    className: "flex items-center gap-2 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-left",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$car$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Car$3e$__["Car"], {
                                                                                            className: "w-4 h-4 flex-shrink-0"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 1582,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-xs sm:text-sm truncate",
                                                                                            children: item.text
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 1583,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    ]
                                                                                }, i, true, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1577,
                                                                                    columnNumber: 33
                                                                                }, this))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1570,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                    lineNumber: 1565,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-2 mb-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                                                                    className: "w-5 h-5 text-purple-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1592,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                    className: "text-sm font-semibold text-gray-300",
                                                                                    children: "Comandos"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1593,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1591,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-2 gap-2",
                                                                            children: [
                                                                                {
                                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1597,
                                                                                        columnNumber: 41
                                                                                    }, this),
                                                                                    text: 'meus créditos'
                                                                                },
                                                                                {
                                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1598,
                                                                                        columnNumber: 41
                                                                                    }, this),
                                                                                    text: 'planos'
                                                                                },
                                                                                {
                                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1599,
                                                                                        columnNumber: 41
                                                                                    }, this),
                                                                                    text: 'como funciona'
                                                                                },
                                                                                {
                                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1600,
                                                                                        columnNumber: 41
                                                                                    }, this),
                                                                                    text: 'ajuda'
                                                                                }
                                                                            ].map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>{
                                                                                        setInput(item.text);
                                                                                        setShowMoreSuggestions(false);
                                                                                        inputRef.current?.focus();
                                                                                    },
                                                                                    className: "flex items-center gap-2 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-left",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex-shrink-0",
                                                                                            children: item.icon
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 1607,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-xs sm:text-sm truncate",
                                                                                            children: item.text
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 1608,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    ]
                                                                                }, i, true, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1602,
                                                                                    columnNumber: 33
                                                                                }, this))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1595,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                    lineNumber: 1590,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/chat/page.tsx",
                                                            lineNumber: 1513,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1506,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1504,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 1488,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/chat/page.tsx",
                                    lineNumber: 1456,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    children: messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                y: 20
                                            },
                                            animate: {
                                                opacity: 1,
                                                y: 0
                                            },
                                            children: [
                                                message.type === 'user' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    className: "flex justify-end",
                                                    initial: {
                                                        opacity: 0,
                                                        x: 20
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        x: 0
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl rounded-tr-md px-5 py-3 max-w-[85%] shadow-lg shadow-blue-500/20",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-white whitespace-pre-wrap text-sm break-words",
                                                            children: message.content
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/chat/page.tsx",
                                                            lineNumber: 1635,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1634,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1629,
                                                    columnNumber: 21
                                                }, this),
                                                message.type === 'ai' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    className: "flex justify-start gap-3",
                                                    initial: {
                                                        opacity: 0,
                                                        x: -20
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        x: 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                className: "w-4 h-4 text-white"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1647,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/chat/page.tsx",
                                                            lineNumber: 1646,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl rounded-tl-md px-5 py-3 max-w-[85%]",
                                                            children: message.content === 'searching_animation' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                                animate: {
                                                                                    rotate: 360
                                                                                },
                                                                                transition: {
                                                                                    duration: 2,
                                                                                    repeat: Infinity,
                                                                                    ease: "linear"
                                                                                },
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                                                    className: "w-5 h-5 text-blue-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1657,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1653,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-white font-semibold",
                                                                                children: "Buscando na internet..."
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1659,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1652,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "space-y-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                                className: "flex items-center gap-2",
                                                                                initial: {
                                                                                    opacity: 0,
                                                                                    x: -20
                                                                                },
                                                                                animate: {
                                                                                    opacity: 1,
                                                                                    x: 0
                                                                                },
                                                                                transition: {
                                                                                    delay: 0.2
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                                                        className: "w-4 h-4 text-green-400"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1669,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-gray-300 text-sm",
                                                                                        children: "Vasculhando a web inteira"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1670,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1663,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                                className: "flex items-center gap-2",
                                                                                initial: {
                                                                                    opacity: 0,
                                                                                    x: -20
                                                                                },
                                                                                animate: {
                                                                                    opacity: 1,
                                                                                    x: 0
                                                                                },
                                                                                transition: {
                                                                                    delay: 0.4
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                                        className: "w-4 h-4 text-yellow-400"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1679,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-gray-300 text-sm",
                                                                                        children: "Comparando preços"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1680,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1673,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                                className: "flex items-center gap-2",
                                                                                initial: {
                                                                                    opacity: 0,
                                                                                    x: -20
                                                                                },
                                                                                animate: {
                                                                                    opacity: 1,
                                                                                    x: 0
                                                                                },
                                                                                transition: {
                                                                                    delay: 0.6
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                                        className: "w-4 h-4 text-purple-400"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1689,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-gray-300 text-sm",
                                                                                        children: "Encontrando as melhores ofertas"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1690,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1683,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1662,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2 pt-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                                                className: "w-4 h-4 text-blue-400 animate-spin"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1695,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-gray-400 text-xs",
                                                                                children: "Aguarde alguns instantes..."
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1696,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1694,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1651,
                                                                columnNumber: 27
                                                            }, this) : message.content === 'location_question' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                                className: "w-4 h-4 text-blue-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1702,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-white font-medium",
                                                                                children: "Localização"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1703,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1701,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-white text-sm",
                                                                        children: "Quer buscar em alguma região específica?"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1706,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "space-y-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center gap-2",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                                                                        className: "w-4 h-4 text-yellow-400"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1710,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-white text-sm font-medium",
                                                                                        children: "Exemplos:"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1711,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1709,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "ml-6 space-y-1",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-gray-300 text-sm",
                                                                                        children: '• "São Paulo"'
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1714,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-gray-300 text-sm",
                                                                                        children: '• "Rio de Janeiro"'
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1715,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-gray-300 text-sm",
                                                                                        children: '• "Minas Gerais"'
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1716,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1713,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1708,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"], {
                                                                                className: "w-4 h-4 text-green-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1721,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-white text-sm",
                                                                                children: 'Ou digite "não" para buscar em todo Brasil'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1722,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1720,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1700,
                                                                columnNumber: 27
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-gray-200 whitespace-pre-wrap text-sm leading-relaxed",
                                                                children: message.content
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1726,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/chat/page.tsx",
                                                            lineNumber: 1649,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1641,
                                                    columnNumber: 21
                                                }, this),
                                                message.type === 'category_question' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-start",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-purple-500/10 border border-purple-500/30 rounded-2xl rounded-tl-sm p-4 max-w-lg w-full",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2 mb-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                                                        className: "w-4 h-4 text-purple-400"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1736,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "text-white font-semibold text-sm",
                                                                        children: "Pergunta Inteligente"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1737,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1735,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2 mb-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                                                        className: "w-4 h-4 text-yellow-400"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1741,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-white text-sm font-medium",
                                                                        children: message.content
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1742,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1740,
                                                                columnNumber: 25
                                                            }, this),
                                                            message.categoryQuestion?.options && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-1 gap-2",
                                                                children: message.categoryQuestion.options.map((option, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>handleSend(option),
                                                                        className: "flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm text-left transition-colors",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hash$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hash$3e$__["Hash"], {
                                                                                className: "w-3 h-3 text-gray-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1753,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: [
                                                                                    i + 1,
                                                                                    ". ",
                                                                                    option
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1754,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, i, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1748,
                                                                        columnNumber: 31
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1746,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1734,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1733,
                                                    columnNumber: 21
                                                }, this),
                                                message.type === 'image_confirmation' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-start",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        initial: {
                                                            scale: 0.9,
                                                            opacity: 0
                                                        },
                                                        animate: {
                                                            scale: 1,
                                                            opacity: 1
                                                        },
                                                        transition: {
                                                            duration: 0.3,
                                                            type: "spring"
                                                        },
                                                        className: "bg-purple-500/10 border border-purple-500/30 rounded-2xl rounded-tl-sm p-4 max-w-lg w-full",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    x: -20,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    x: 0,
                                                                    opacity: 1
                                                                },
                                                                transition: {
                                                                    delay: 0.1
                                                                },
                                                                className: "flex items-center gap-2 mb-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                        animate: {
                                                                            rotate: [
                                                                                0,
                                                                                10,
                                                                                -10,
                                                                                0
                                                                            ]
                                                                        },
                                                                        transition: {
                                                                            duration: 0.5,
                                                                            repeat: Infinity,
                                                                            repeatDelay: 2
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                            className: "w-4 h-4 text-purple-400"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1781,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1777,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "text-white font-semibold text-sm",
                                                                        children: "Produto Identificado"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1783,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1771,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    y: -10,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    y: 0,
                                                                    opacity: 1
                                                                },
                                                                transition: {
                                                                    delay: 0.2
                                                                },
                                                                className: "bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-2 relative group",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2 mb-1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs text-blue-400 font-medium flex items-center gap-1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "animate-pulse",
                                                                                    children: "✏️"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1794,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                "Clique para editar"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1793,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1792,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "text",
                                                                        defaultValue: message.detectedProduct,
                                                                        onClick: (e)=>e.stopPropagation(),
                                                                        onKeyDown: (e)=>{
                                                                            e.stopPropagation();
                                                                            if (e.key === 'Enter') {
                                                                                const newName = e.target.value;
                                                                                setDetectedProductName(newName);
                                                                                setMessages((prev)=>{
                                                                                    const updated = [
                                                                                        ...prev
                                                                                    ];
                                                                                    const idx = updated.findIndex((m)=>m.id === message.id);
                                                                                    if (idx >= 0 && updated[idx].detectedProduct) {
                                                                                        updated[idx].detectedProduct = newName;
                                                                                    }
                                                                                    return updated;
                                                                                });
                                                                                e.target.blur();
                                                                            }
                                                                        },
                                                                        className: "w-full bg-transparent text-blue-300 text-sm font-medium outline-none border-b border-blue-500/30 pb-1 focus:border-blue-400 transition-colors cursor-text hover:border-blue-400/50",
                                                                        placeholder: "Edite o nome do produto..."
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1798,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-gray-400 mt-1",
                                                                        children: "Pressione Enter para salvar"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1821,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1786,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    scale: 0.95,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    scale: 1,
                                                                    opacity: 1
                                                                },
                                                                transition: {
                                                                    delay: 0.3
                                                                },
                                                                className: "bg-black/20 rounded-lg p-3 mb-3 border border-white/10",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "space-y-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                                    className: "w-4 h-4 text-green-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1832,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-green-300 text-sm font-medium",
                                                                                    children: [
                                                                                        "Já gasto: -",
                                                                                        message.creditCost || 1,
                                                                                        " crédito (identificação)"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1833,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1831,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                                                                    className: "w-4 h-4 text-yellow-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1836,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-gray-300 text-sm",
                                                                                    children: "Buscar preços: +1 crédito adicional"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1837,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1835,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                    lineNumber: 1830,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1824,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    y: 10,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    y: 0,
                                                                    opacity: 1
                                                                },
                                                                transition: {
                                                                    delay: 0.4
                                                                },
                                                                className: "flex gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                                        whileHover: {
                                                                            scale: 1.05
                                                                        },
                                                                        whileTap: {
                                                                            scale: 0.95
                                                                        },
                                                                        onClick: handleImageSearchReject,
                                                                        disabled: loading || chatState === 'searching',
                                                                        className: "flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm hover:bg-white/20 transition-colors",
                                                                        children: "Não"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1848,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                                        whileHover: {
                                                                            scale: 1.05
                                                                        },
                                                                        whileTap: {
                                                                            scale: 0.95
                                                                        },
                                                                        onClick: handleImagePriceSearch,
                                                                        disabled: loading || chatState === 'searching',
                                                                        className: "flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white text-sm disabled:opacity-50 shadow-lg shadow-green-500/20",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                                                            animate: {
                                                                                opacity: [
                                                                                    1,
                                                                                    0.7,
                                                                                    1
                                                                                ]
                                                                            },
                                                                            transition: {
                                                                                duration: 1.5,
                                                                                repeat: Infinity
                                                                            },
                                                                            children: "Sim, buscar!"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1864,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1857,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1842,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1765,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1764,
                                                    columnNumber: 21
                                                }, this),
                                                message.type === 'sort_question' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-start",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        initial: {
                                                            scale: 0.9,
                                                            opacity: 0
                                                        },
                                                        animate: {
                                                            scale: 1,
                                                            opacity: 1
                                                        },
                                                        transition: {
                                                            duration: 0.3,
                                                            type: "spring"
                                                        },
                                                        className: "bg-blue-500/10 border border-blue-500/30 rounded-2xl rounded-tl-sm p-4 max-w-lg w-full",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    x: -20,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    x: 0,
                                                                    opacity: 1
                                                                },
                                                                transition: {
                                                                    delay: 0.1
                                                                },
                                                                className: "flex items-center gap-2 mb-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                        animate: {
                                                                            rotate: [
                                                                                0,
                                                                                10,
                                                                                -10,
                                                                                0
                                                                            ]
                                                                        },
                                                                        transition: {
                                                                            duration: 0.5,
                                                                            repeat: Infinity,
                                                                            repeatDelay: 2
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                            className: "w-4 h-4 text-blue-400"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1894,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1890,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "text-white font-semibold text-sm",
                                                                        children: message.content
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1896,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1884,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-1 gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                                        whileHover: {
                                                                            scale: 1.02
                                                                        },
                                                                        whileTap: {
                                                                            scale: 0.98
                                                                        },
                                                                        onClick: ()=>executeImageSearch('BEST_MATCH'),
                                                                        disabled: loading,
                                                                        className: "flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm text-left transition-colors disabled:opacity-50",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                                    className: "w-4 h-4 text-purple-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1908,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1907,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "font-medium",
                                                                                        children: "Maior relevância"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1911,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-gray-400",
                                                                                        children: "Produtos mais relacionados"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1912,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1910,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1900,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                                        whileHover: {
                                                                            scale: 1.02
                                                                        },
                                                                        whileTap: {
                                                                            scale: 0.98
                                                                        },
                                                                        onClick: ()=>executeImageSearch('LOWEST_PRICE'),
                                                                        disabled: loading,
                                                                        className: "flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm text-left transition-colors disabled:opacity-50",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                                                    className: "w-4 h-4 text-green-400 rotate-90"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1924,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1923,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "font-medium",
                                                                                        children: "Menor preço"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1927,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-gray-400",
                                                                                        children: "Do mais barato ao mais caro"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1928,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1926,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1916,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                                        whileHover: {
                                                                            scale: 1.02
                                                                        },
                                                                        whileTap: {
                                                                            scale: 0.98
                                                                        },
                                                                        onClick: ()=>executeImageSearch('HIGHEST_PRICE'),
                                                                        disabled: loading,
                                                                        className: "flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm text-left transition-colors disabled:opacity-50",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                                                    className: "w-4 h-4 text-yellow-400 -rotate-90"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 1940,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1939,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "font-medium",
                                                                                        children: "Maior preço"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1943,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-gray-400",
                                                                                        children: "Do mais caro ao mais barato"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1944,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1942,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1932,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1899,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1878,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1877,
                                                    columnNumber: 21
                                                }, this),
                                                message.type === 'confirmation' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-start",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        initial: {
                                                            scale: 0.9,
                                                            opacity: 0
                                                        },
                                                        animate: {
                                                            scale: 1,
                                                            opacity: 1
                                                        },
                                                        transition: {
                                                            duration: 0.3,
                                                            type: "spring"
                                                        },
                                                        className: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl rounded-tl-md p-5 max-w-lg w-full shadow-lg",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    x: -20,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    x: 0,
                                                                    opacity: 1
                                                                },
                                                                transition: {
                                                                    delay: 0.1
                                                                },
                                                                className: "flex items-center gap-2 mb-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                        animate: {
                                                                            rotate: [
                                                                                0,
                                                                                10,
                                                                                -10,
                                                                                0
                                                                            ]
                                                                        },
                                                                        transition: {
                                                                            duration: 0.5,
                                                                            repeat: Infinity,
                                                                            repeatDelay: 2
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                            className: "w-5 h-5 text-yellow-400"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 1970,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1966,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "text-white font-semibold",
                                                                        children: "Pronto para buscar!"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1972,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1960,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    scale: 0.95,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    scale: 1,
                                                                    opacity: 1
                                                                },
                                                                transition: {
                                                                    delay: 0.2
                                                                },
                                                                className: "bg-black/30 rounded-2xl p-4 mb-4 border border-white/10 cursor-pointer hover:border-blue-400/50 transition-colors group",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-start gap-3 mb-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                                                className: "w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1982,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex-1",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-gray-400 mb-1",
                                                                                        children: "Busca final:"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1984,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "text",
                                                                                        defaultValue: message.content,
                                                                                        onClick: (e)=>e.stopPropagation(),
                                                                                        onKeyDown: (e)=>e.stopPropagation(),
                                                                                        onChange: (e)=>{
                                                                                            setMessages((prev)=>{
                                                                                                const updated = [
                                                                                                    ...prev
                                                                                                ];
                                                                                                const idx = updated.findIndex((m)=>m.id === message.id);
                                                                                                if (idx >= 0) updated[idx].content = e.target.value;
                                                                                                return updated;
                                                                                            });
                                                                                        },
                                                                                        className: "w-full bg-transparent text-white font-medium text-lg outline-none border-b border-transparent group-hover:border-blue-400/30 focus:border-blue-400 transition-colors pb-1",
                                                                                        placeholder: "Edite a busca..."
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 1985,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 1983,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 1981,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2 pt-3 border-t border-white/10",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                                                                className: "w-4 h-4 text-yellow-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 2005,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-sm text-gray-300",
                                                                                children: [
                                                                                    "Custo: ",
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-yellow-400 font-semibold",
                                                                                        children: "1 crédito"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 2006,
                                                                                        columnNumber: 73
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 2006,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 2004,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 1975,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    y: -10,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    y: 0,
                                                                    opacity: 1
                                                                },
                                                                transition: {
                                                                    delay: 0.3
                                                                },
                                                                className: "bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-blue-300 text-xs flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "animate-pulse",
                                                                            children: "✏️"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 2017,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        "Clique no texto acima para editar antes de confirmar"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                    lineNumber: 2016,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 2010,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    y: 10,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    y: 0,
                                                                    opacity: 1
                                                                },
                                                                transition: {
                                                                    delay: 0.4
                                                                },
                                                                className: "flex gap-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                                        whileHover: {
                                                                            scale: 1.05
                                                                        },
                                                                        whileTap: {
                                                                            scale: 0.95
                                                                        },
                                                                        onClick: handleCancelSearch,
                                                                        className: "flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm hover:bg-white/20 transition-colors font-medium",
                                                                        children: "Cancelar"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 2028,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                                        whileHover: {
                                                                            scale: 1.05
                                                                        },
                                                                        whileTap: {
                                                                            scale: 0.95
                                                                        },
                                                                        onClick: handleConfirmSearch,
                                                                        disabled: loading || chatState === 'searching',
                                                                        className: "flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white text-sm disabled:opacity-50 shadow-lg shadow-green-500/30 font-semibold",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                                                            animate: {
                                                                                opacity: [
                                                                                    1,
                                                                                    0.7,
                                                                                    1
                                                                                ]
                                                                            },
                                                                            transition: {
                                                                                duration: 1.5,
                                                                                repeat: Infinity
                                                                            },
                                                                            className: "flex items-center justify-center gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                                    className: "w-4 h-4"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 2048,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                "Confirmar Busca"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 2043,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 2036,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 2022,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 1954,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 1953,
                                                    columnNumber: 21
                                                }, this),
                                                message.type === 'products' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-3 sm:space-y-4",
                                                    children: message.products && message.products.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3",
                                                                children: message.products.slice(0, 6).map((product, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductCard"], {
                                                                        product: product
                                                                    }, product.id || idx, false, {
                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                        lineNumber: 2063,
                                                                        columnNumber: 31
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 2061,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center gap-2 sm:gap-3",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                                            className: "w-4 h-4 sm:w-5 sm:h-5 text-green-400"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 2073,
                                                                                            columnNumber: 37
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 2072,
                                                                                        columnNumber: 35
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                                className: "text-white font-semibold text-sm sm:text-base",
                                                                                                children: "Busca concluída!"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                                lineNumber: 2076,
                                                                                                columnNumber: 37
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                className: "text-gray-400 text-xs sm:text-sm",
                                                                                                children: [
                                                                                                    "Encontramos ",
                                                                                                    message.products.length,
                                                                                                    " produtos para você"
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                                lineNumber: 2077,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/chat/page.tsx",
                                                                                        lineNumber: 2075,
                                                                                        columnNumber: 35
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/chat/page.tsx",
                                                                                lineNumber: 2071,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 2070,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex flex-col sm:flex-row items-start sm:items-center justify-between bg-black/20 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 gap-3 sm:gap-0",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center gap-2 sm:gap-3",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                                                                            className: "w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 2084,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                    className: "text-gray-400 text-[10px] sm:text-xs",
                                                                                                    children: "Créditos utilizados"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                                    lineNumber: 2086,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                    className: "text-white font-semibold text-xs sm:text-base",
                                                                                                    children: "-1 crédito"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                                    lineNumber: 2087,
                                                                                                    columnNumber: 37
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 2085,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 2083,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "h-px w-full sm:h-8 sm:w-px bg-white/10"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 2090,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center gap-2 sm:gap-3",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                                                                            className: "w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 2092,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                    className: "text-gray-400 text-[10px] sm:text-xs",
                                                                                                    children: "Saldo restante"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                                    lineNumber: 2094,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                    className: "text-white font-semibold text-xs sm:text-base",
                                                                                                    children: [
                                                                                                        message.content.match(/Restantes: (\d+)/)?.[1] || userCredits,
                                                                                                        " créditos"
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                                    lineNumber: 2095,
                                                                                                    columnNumber: 37
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                                            lineNumber: 2093,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 2091,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 2082,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-300 text-xs sm:text-sm",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                                                    className: "w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 2101,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[11px] sm:text-sm",
                                                                                    children: "Quer buscar outro produto?"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 2102,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                                                    className: "w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hidden sm:block"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 2103,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-white font-medium text-[11px] sm:text-sm",
                                                                                    children: "Digite agora!"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                                    lineNumber: 2104,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/chat/page.tsx",
                                                                            lineNumber: 2100,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/chat/page.tsx",
                                                                    lineNumber: 2069,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/chat/page.tsx",
                                                                lineNumber: 2068,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 2058,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, message.id, true, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 1623,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/chat/page.tsx",
                                    lineNumber: 1621,
                                    columnNumber: 13
                                }, this),
                                loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0
                                    },
                                    animate: {
                                        opacity: 1
                                    },
                                    className: "flex justify-start",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-white/5 border border-white/10 rounded-2xl px-6 py-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-4 h-4 text-blue-400 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 2120,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-gray-400 text-sm",
                                                    children: "Processando..."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 2121,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 2119,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 2118,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/chat/page.tsx",
                                    lineNumber: 2117,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: messagesEndRef
                                }, void 0, false, {
                                    fileName: "[project]/app/chat/page.tsx",
                                    lineNumber: 2127,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/chat/page.tsx",
                            lineNumber: 1454,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/chat/page.tsx",
                        lineNumber: 1453,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t border-white/5 bg-black/20 backdrop-blur-2xl p-4 sm:p-6 safe-area-bottom",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-4xl mx-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    children: uploadedImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            y: 10,
                                            scale: 0.9
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0,
                                            scale: 1
                                        },
                                        exit: {
                                            opacity: 0,
                                            scale: 0.8,
                                            transition: {
                                                duration: 0.2
                                            }
                                        },
                                        className: "mb-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative inline-block",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: uploadedImage,
                                                    alt: "Preview",
                                                    className: "h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-2xl border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 2143,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                                    onClick: ()=>{
                                                        setUploadedImage(null);
                                                        setImageFile(null);
                                                    },
                                                    whileHover: {
                                                        scale: 1.1
                                                    },
                                                    whileTap: {
                                                        scale: 0.9
                                                    },
                                                    className: "absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition shadow-lg",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                        className: "w-3 h-3 text-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/chat/page.tsx",
                                                        lineNumber: 2157,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 2148,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 2142,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/page.tsx",
                                        lineNumber: 2136,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/chat/page.tsx",
                                    lineNumber: 2134,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            ref: fileInputRef,
                                            type: "file",
                                            accept: "image/*",
                                            onChange: handleImageUpload,
                                            className: "hidden"
                                        }, void 0, false, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 2165,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                            onClick: ()=>fileInputRef.current?.click(),
                                            disabled: loading,
                                            whileHover: {
                                                scale: 1.05
                                            },
                                            whileTap: {
                                                scale: 0.95
                                            },
                                            className: "px-4 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-white disabled:opacity-50 transition-all flex-shrink-0 shadow-lg",
                                            title: "Buscar por imagem",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                                className: "w-5 h-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/page.tsx",
                                                lineNumber: 2180,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 2172,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            ref: inputRef,
                                            type: "text",
                                            value: input,
                                            onChange: (e)=>setInput(e.target.value),
                                            onKeyDown: (e)=>{
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            },
                                            placeholder: uploadedImage ? "Ou digite..." : "Digite um produto...",
                                            className: "flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:bg-white/10 text-sm transition-all backdrop-blur-xl",
                                            disabled: loading
                                        }, void 0, false, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 2183,
                                            columnNumber: 15
                                        }, this),
                                        uploadedImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                            onClick: handleImageSearch,
                                            disabled: loading,
                                            whileHover: {
                                                scale: 1.05
                                            },
                                            whileTap: {
                                                scale: 0.95
                                            },
                                            className: "px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-500/30 flex-shrink-0 font-medium",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 2207,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm hidden sm:inline",
                                                    children: "Buscar"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 2208,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 2200,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                            onClick: ()=>handleSend(),
                                            disabled: loading || !input.trim(),
                                            whileHover: {
                                                scale: 1.05
                                            },
                                            whileTap: {
                                                scale: 0.95
                                            },
                                            className: "px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/30 flex-shrink-0 font-medium",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 2218,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm hidden sm:inline",
                                                    children: "Enviar"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/chat/page.tsx",
                                                    lineNumber: 2219,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/chat/page.tsx",
                                            lineNumber: 2211,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/chat/page.tsx",
                                    lineNumber: 2164,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/chat/page.tsx",
                            lineNumber: 2133,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/chat/page.tsx",
                        lineNumber: 2132,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/chat/page.tsx",
                lineNumber: 1407,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/chat/page.tsx",
        lineNumber: 1312,
        columnNumber: 5
    }, this);
}
_s(ChatPage, "Bs/I8F3sK5s00E9RkIQOEIlG6e8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ChatPage;
var _c;
__turbopack_context__.k.register(_c, "ChatPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_7a483903._.js.map
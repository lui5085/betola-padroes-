"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaMatchesRepository = void 0;
var core_1 = require("@betola/core");
var PrismaMatchesRepository = /** @class */ (function () {
    function PrismaMatchesRepository(prisma) {
        this.prisma = prisma;
    }
    PrismaMatchesRepository.prototype.save = function (match) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.create({
                            data: {
                                id: match.id.value,
                                externalId: match.externalId,
                                homeTeamId: match.homeTeamId.value,
                                awayTeamId: match.awayTeamId.value,
                                kickoffTime: match.kickoffTime.value,
                                status: match.status.value,
                                homeScore: match.homeScore,
                                awayScore: match.awayScore,
                                round: match.round,
                                season: match.season
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var match;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.findUnique({
                            where: { id: id.value }
                        })];
                    case 1:
                        match = _a.sent();
                        if (!match)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.toDomain(match)];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.findByExternalId = function (externalId) {
        return __awaiter(this, void 0, void 0, function () {
            var match;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.findUnique({
                            where: { externalId: externalId }
                        })];
                    case 1:
                        match = _a.sent();
                        if (!match)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.toDomain(match)];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.findUpcoming = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.findMany({
                            where: {
                                status: 'SCHEDULED',
                                kickoffTime: {
                                    gte: new Date()
                                }
                            },
                            orderBy: { kickoffTime: 'asc' },
                            take: limit || 20
                        })];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, matches.map(function (match) { return _this.toDomain(match); })];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.findByFilters = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var where, startOfDay, endOfDay, matches;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = {};
                        if (filters.status) {
                            where.status = filters.status;
                        }
                        if (filters.upcoming) {
                            where.kickoffTime = { gte: new Date() };
                        }
                        if (filters.date) {
                            startOfDay = new Date(filters.date);
                            startOfDay.setHours(0, 0, 0, 0);
                            endOfDay = new Date(filters.date);
                            endOfDay.setHours(23, 59, 59, 999);
                            where.kickoffTime = {
                                gte: startOfDay,
                                lte: endOfDay
                            };
                        }
                        return [4 /*yield*/, this.prisma.match.findMany({
                                where: where,
                                orderBy: { kickoffTime: 'asc' }
                            })];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, matches.map(function (match) { return _this.toDomain(match); })];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.findByStatus = function (status) {
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.findMany({
                            where: { status: status },
                            orderBy: { kickoffTime: 'asc' }
                        })];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, matches.map(function (match) { return _this.toDomain(match); })];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.findAvailableForBetting = function () {
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.findMany({
                            where: {
                                status: { in: ['SCHEDULED', 'LIVE'] },
                                kickoffTime: {
                                    gte: new Date()
                                }
                            },
                            orderBy: { kickoffTime: 'asc' }
                        })];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, matches.map(function (match) { return _this.toDomain(match); })];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.findFinishedWithPendingBets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.findMany({
                            where: {
                                status: 'FINISHED',
                                betSelections: {
                                    some: {
                                        bet: {
                                            status: 'PENDING'
                                        }
                                    }
                                }
                            },
                            orderBy: { kickoffTime: 'desc' }
                        })];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, matches.map(function (match) { return _this.toDomain(match); })];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.findSettlementPending = function () {
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.findMany({
                            where: {
                                status: 'FINISHED',
                                betSelections: {
                                    some: {
                                        bet: {
                                            status: 'PENDING'
                                        }
                                    }
                                }
                            },
                            include: {
                                homeTeam: true,
                                awayTeam: true
                            }
                        })];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, matches.map(function (match) { return _this.toDomain(match); })];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.update = function (match) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.update({
                            where: { id: match.id.value },
                            data: {
                                status: match.status.value,
                                homeScore: match.homeScore,
                                awayScore: match.awayScore,
                                updatedAt: match.updatedAt.value
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.upsert = function (match) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.match.upsert({
                            where: { id: match.id.value },
                            create: {
                                id: match.id.value,
                                externalId: match.externalId,
                                homeTeamId: match.homeTeamId.value,
                                awayTeamId: match.awayTeamId.value,
                                kickoffTime: match.kickoffTime.value,
                                status: match.status.value,
                                homeScore: match.homeScore,
                                awayScore: match.awayScore,
                                round: match.round,
                                season: match.season
                            },
                            update: {
                                status: match.status.value,
                                homeScore: match.homeScore,
                                awayScore: match.awayScore,
                                updatedAt: match.updatedAt.value
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PrismaMatchesRepository.prototype.toDomain = function (match) {
        return new core_1.Match({
            id: new core_1.MatchId(match.id),
            externalId: match.externalId,
            homeTeamId: new core_1.TeamId(match.homeTeamId),
            awayTeamId: new core_1.TeamId(match.awayTeamId),
            kickoffTime: new core_1.DateTime(match.kickoffTime),
            status: new core_1.MatchStatusVO(match.status),
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            round: match.round,
            season: match.season,
            createdAt: new core_1.DateTime(match.createdAt),
            updatedAt: new core_1.DateTime(match.updatedAt)
        });
    };
    return PrismaMatchesRepository;
}());
exports.PrismaMatchesRepository = PrismaMatchesRepository;

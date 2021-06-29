/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  bilibili: {
    nested: {
      community: {
        nested: {
          service: {
            nested: {
              dm: {
                nested: {
                  v1: {
                    nested: {
                      DM: {
                        methods: {
                          DmPlayerConfig: {
                            requestType: "DmPlayerConfigReq",
                            responseType: "Response"
                          },
                          DmSegMobile: {
                            requestType: "DmSegMobileReq",
                            responseType: "DmSegMobileReply"
                          },
                          DmView: {
                            requestType: "DmViewReq",
                            responseType: "DmViewReply"
                          }
                        }
                      },
                      DmPlayerConfigReq: {
                        fields: {
                          ts: {
                            type: "int64",
                            id: 1
                          },
                          "switch": {
                            type: "PlayerDanmakuSwitch",
                            id: 2
                          },
                          switchSave: {
                            type: "PlayerDanmakuSwitchSave",
                            id: 3
                          },
                          useDefaultConfig: {
                            type: "PlayerDanmakuUseDefaultConfig",
                            id: 4
                          },
                          aiRecommendedSwitch: {
                            type: "PlayerDanmakuAiRecommendedSwitch",
                            id: 5
                          },
                          aiRecommendedLevel: {
                            type: "PlayerDanmakuAiRecommendedLevel",
                            id: 6
                          },
                          blocktop: {
                            type: "PlayerDanmakuBlocktop",
                            id: 7
                          },
                          blockscroll: {
                            type: "PlayerDanmakuBlockscroll",
                            id: 8
                          },
                          blockbottom: {
                            type: "PlayerDanmakuBlockbottom",
                            id: 9
                          },
                          blockcolorful: {
                            type: "PlayerDanmakuBlockcolorful",
                            id: 10
                          },
                          blockrepeat: {
                            type: "PlayerDanmakuBlockrepeat",
                            id: 11
                          },
                          blockspecial: {
                            type: "PlayerDanmakuBlockspecial",
                            id: 12
                          },
                          opacity: {
                            type: "PlayerDanmakuOpacity",
                            id: 13
                          },
                          scalingfactor: {
                            type: "PlayerDanmakuScalingfactor",
                            id: 14
                          },
                          domain: {
                            type: "PlayerDanmakuDomain",
                            id: 15
                          },
                          speed: {
                            type: "PlayerDanmakuSpeed",
                            id: 16
                          },
                          enableblocklist: {
                            type: "PlayerDanmakuEnableblocklist",
                            id: 17
                          },
                          inlinePlayerDanmakuSwitch: {
                            type: "InlinePlayerDanmakuSwitch",
                            id: 18
                          }
                        }
                      },
                      Response: {
                        fields: {
                          code: {
                            type: "int32",
                            id: 1
                          },
                          message: {
                            type: "string",
                            id: 2
                          }
                        }
                      },
                      DmSegMobileReq: {
                        fields: {
                          pid: {
                            type: "int64",
                            id: 1
                          },
                          oid: {
                            type: "int64",
                            id: 2
                          },
                          type: {
                            type: "int32",
                            id: 3
                          },
                          segmentIndex: {
                            type: "int64",
                            id: 4
                          },
                          teenagersMode: {
                            type: "int32",
                            id: 5
                          }
                        }
                      },
                      DmSegMobileReply: {
                        fields: {
                          elems: {
                            rule: "repeated",
                            type: "DanmakuElem",
                            id: 1
                          },
                          state: {
                            type: "int32",
                            id: 2
                          },
                          aiFlag: {
                            type: "DanmakuAIFlag",
                            id: 3
                          }
                        }
                      },
                      DmViewReq: {
                        fields: {
                          pid: {
                            type: "int64",
                            id: 1
                          },
                          oid: {
                            type: "int64",
                            id: 2
                          },
                          type: {
                            type: "int32",
                            id: 3
                          },
                          spmid: {
                            type: "string",
                            id: 4
                          },
                          isHardBoot: {
                            type: "int32",
                            id: 5
                          }
                        }
                      },
                      DmViewReply: {
                        fields: {
                          closed: {
                            type: "bool",
                            id: 1
                          },
                          mask: {
                            type: "VideoMask",
                            id: 2
                          },
                          subtitle: {
                            type: "VideoSubtitle",
                            id: 3
                          },
                          specialDms: {
                            rule: "repeated",
                            type: "string",
                            id: 4
                          },
                          aiFlag: {
                            type: "DanmakuFlagConfig",
                            id: 5
                          },
                          playerConfig: {
                            type: "DanmuPlayerViewConfig",
                            id: 6
                          },
                          sendBoxStyle: {
                            type: "int32",
                            id: 7
                          },
                          allow: {
                            type: "bool",
                            id: 8
                          },
                          checkBox: {
                            type: "string",
                            id: 9
                          },
                          checkBoxShowMsg: {
                            type: "string",
                            id: 10
                          },
                          textPlaceholder: {
                            type: "string",
                            id: 11
                          },
                          inputPlaceholder: {
                            type: "string",
                            id: 12
                          },
                          reportFilterContent: {
                            rule: "repeated",
                            type: "string",
                            id: 13
                          }
                        }
                      },
                      DanmakuAIFlag: {
                        fields: {
                          dmFlags: {
                            rule: "repeated",
                            type: "DanmakuFlag",
                            id: 1
                          }
                        }
                      },
                      DanmakuElem: {
                        fields: {
                          id: {
                            type: "int64",
                            id: 1
                          },
                          progress: {
                            type: "int32",
                            id: 2
                          },
                          mode: {
                            type: "int32",
                            id: 3
                          },
                          fontsize: {
                            type: "int32",
                            id: 4
                          },
                          color: {
                            type: "uint32",
                            id: 5
                          },
                          midHash: {
                            type: "string",
                            id: 6
                          },
                          content: {
                            type: "string",
                            id: 7
                          },
                          ctime: {
                            type: "int64",
                            id: 8
                          },
                          weight: {
                            type: "int32",
                            id: 9
                          },
                          action: {
                            type: "string",
                            id: 10
                          },
                          pool: {
                            type: "int32",
                            id: 11
                          },
                          idStr: {
                            type: "string",
                            id: 12
                          },
                          attr: {
                            type: "int32",
                            id: 13
                          }
                        }
                      },
                      DanmakuFlag: {
                        fields: {
                          dmid: {
                            type: "int64",
                            id: 1
                          },
                          flag: {
                            type: "uint32",
                            id: 2
                          }
                        }
                      },
                      DanmakuFlagConfig: {
                        fields: {
                          recFlag: {
                            type: "int32",
                            id: 1
                          },
                          recText: {
                            type: "string",
                            id: 2
                          },
                          recSwitch: {
                            type: "int32",
                            id: 3
                          }
                        }
                      },
                      DanmuDefaultPlayerConfig: {
                        fields: {
                          playerDanmakuUseDefaultConfig: {
                            type: "bool",
                            id: 1
                          },
                          playerDanmakuAiRecommendedSwitch: {
                            type: "bool",
                            id: 4
                          },
                          playerDanmakuAiRecommendedLevel: {
                            type: "int32",
                            id: 5
                          },
                          playerDanmakuBlocktop: {
                            type: "bool",
                            id: 6
                          },
                          playerDanmakuBlockscroll: {
                            type: "bool",
                            id: 7
                          },
                          playerDanmakuBlockbottom: {
                            type: "bool",
                            id: 8
                          },
                          playerDanmakuBlockcolorful: {
                            type: "bool",
                            id: 9
                          },
                          playerDanmakuBlockrepeat: {
                            type: "bool",
                            id: 10
                          },
                          playerDanmakuBlockspecial: {
                            type: "bool",
                            id: 11
                          },
                          playerDanmakuOpacity: {
                            type: "float",
                            id: 12
                          },
                          playerDanmakuScalingfactor: {
                            type: "float",
                            id: 13
                          },
                          playerDanmakuDomain: {
                            type: "float",
                            id: 14
                          },
                          playerDanmakuSpeed: {
                            type: "int32",
                            id: 15
                          },
                          inlinePlayerDanmakuSwitch: {
                            type: "bool",
                            id: 16
                          }
                        }
                      },
                      DanmuPlayerConfig: {
                        fields: {
                          playerDanmakuSwitch: {
                            type: "bool",
                            id: 1
                          },
                          playerDanmakuSwitchSave: {
                            type: "bool",
                            id: 2
                          },
                          playerDanmakuUseDefaultConfig: {
                            type: "bool",
                            id: 3
                          },
                          playerDanmakuAiRecommendedSwitch: {
                            type: "bool",
                            id: 4
                          },
                          playerDanmakuAiRecommendedLevel: {
                            type: "int32",
                            id: 5
                          },
                          playerDanmakuBlocktop: {
                            type: "bool",
                            id: 6
                          },
                          playerDanmakuBlockscroll: {
                            type: "bool",
                            id: 7
                          },
                          playerDanmakuBlockbottom: {
                            type: "bool",
                            id: 8
                          },
                          playerDanmakuBlockcolorful: {
                            type: "bool",
                            id: 9
                          },
                          playerDanmakuBlockrepeat: {
                            type: "bool",
                            id: 10
                          },
                          playerDanmakuBlockspecial: {
                            type: "bool",
                            id: 11
                          },
                          playerDanmakuOpacity: {
                            type: "float",
                            id: 12
                          },
                          playerDanmakuScalingfactor: {
                            type: "float",
                            id: 13
                          },
                          playerDanmakuDomain: {
                            type: "float",
                            id: 14
                          },
                          playerDanmakuSpeed: {
                            type: "int32",
                            id: 15
                          },
                          playerDanmakuEnableblocklist: {
                            type: "bool",
                            id: 16
                          },
                          inlinePlayerDanmakuSwitch: {
                            type: "bool",
                            id: 17
                          },
                          inlinePlayerDanmakuConfig: {
                            type: "int32",
                            id: 18
                          }
                        }
                      },
                      DanmuPlayerDynamicConfig: {
                        fields: {
                          progress: {
                            type: "int32",
                            id: 1
                          },
                          playerDanmakuDomain: {
                            type: "float",
                            id: 2
                          }
                        }
                      },
                      DanmuPlayerViewConfig: {
                        fields: {
                          danmukuDefaultPlayerConfig: {
                            type: "DanmuDefaultPlayerConfig",
                            id: 1
                          },
                          danmukuPlayerConfig: {
                            type: "DanmuPlayerConfig",
                            id: 2
                          },
                          danmukuPlayerDynamicConfig: {
                            rule: "repeated",
                            type: "DanmuPlayerDynamicConfig",
                            id: 3
                          }
                        }
                      },
                      InlinePlayerDanmakuSwitch: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuAiRecommendedLevel: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuAiRecommendedSwitch: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuBlockbottom: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuBlockcolorful: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuBlockrepeat: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuBlockscroll: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuBlockspecial: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuBlocktop: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuDomain: {
                        fields: {
                          value: {
                            type: "float",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuEnableblocklist: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuOpacity: {
                        fields: {
                          value: {
                            type: "float",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuScalingfactor: {
                        fields: {
                          value: {
                            type: "float",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuSpeed: {
                        fields: {
                          value: {
                            type: "int32",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuSwitch: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuSwitchSave: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      PlayerDanmakuUseDefaultConfig: {
                        fields: {
                          value: {
                            type: "bool",
                            id: 1
                          }
                        }
                      },
                      SubtitleItem: {
                        fields: {
                          id: {
                            type: "int64",
                            id: 1
                          },
                          idStr: {
                            type: "string",
                            id: 2
                          },
                          lan: {
                            type: "string",
                            id: 3
                          },
                          lanDoc: {
                            type: "string",
                            id: 4
                          },
                          subtitleUrl: {
                            type: "string",
                            id: 5
                          },
                          author: {
                            type: "UserInfo",
                            id: 6
                          }
                        }
                      },
                      UserInfo: {
                        fields: {
                          mid: {
                            type: "int64",
                            id: 1
                          },
                          name: {
                            type: "string",
                            id: 2
                          },
                          sex: {
                            type: "string",
                            id: 3
                          },
                          face: {
                            type: "string",
                            id: 4
                          },
                          sign: {
                            type: "string",
                            id: 5
                          },
                          rank: {
                            type: "int32",
                            id: 6
                          }
                        }
                      },
                      VideoMask: {
                        fields: {
                          cid: {
                            type: "int64",
                            id: 1
                          },
                          plat: {
                            type: "int32",
                            id: 2
                          },
                          fps: {
                            type: "int32",
                            id: 3
                          },
                          time: {
                            type: "int64",
                            id: 4
                          },
                          maskUrl: {
                            type: "string",
                            id: 5
                          }
                        }
                      },
                      VideoSubtitle: {
                        fields: {
                          lan: {
                            type: "string",
                            id: 1
                          },
                          lanDoc: {
                            type: "string",
                            id: 2
                          },
                          subtitles: {
                            rule: "repeated",
                            type: "SubtitleItem",
                            id: 3
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});

module.exports = $root;

<template>
    <div class="player" v-if="playList.length > 0">
        <transition name="normal" 
            @enter="enter"
            @after-enter="afterEnter"
            @leave="leave"
            @after-leave="afterLeave"
        >
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img width="100%" height="100%" :src=" currentSong.image"/>
                </div>
                <div class="top">
                    <div class="back" @click="back">
                        <i class="iconfont icon-return"></i>
                    </div>
                    <h1 class="title no-wrap" v-html = "currentSong.name"></h1>
                    <h2 class="subtitle" v-html = "currentSong.singer"></h2>
                </div>
                <div class="middle">
                    <div class="middel-l">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="play">
                                <img class="image" :src=" currentSong.image"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <div class="operators">
                        <div class="iconfont icon i-left">
                            <i class="icon-random"></i>
                        </div>
                        <div class="iconfont icon i-left" :class="disable">
                            <i @click="prev" class="icon-prev"></i>
                        </div>
                        <div class="iconfont icon i-center" :class="disable">
                            <i @click="togglePlaying" :class="playIcon"></i>
                        </div>
                        <div class="iconfont icon i-right" :class="disable">
                            <i @click="next" class="icon-next"></i>
                        </div>
                        <div class="iconfont icon i-right">
                            <i class="icon-love"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <div class="icon">
                    <img width="40" height="40" :src=" currentSong.image" :class="play"/>
                </div>
                <div class="text">
                    <h2 class="name no-wrap" v-html = "currentSong.name"></h2>
                    <p class="desc no-wrap" v-html = "currentSong.singer"></p>
                </div>
                <div class="control">
                    <div @click.stop="togglePlaying" class="iconfont" :class="playIcon"></div>
                </div>
                <div class="control">
                    <div class="iconfont icon-list"></div>
                </div>
            </div>
        </transition>
        <audio v-if="url" ref="audio" :src="url" @canplay="ready" @error="error" @ended="ended"></audio>
    </div>
</template>
<script>
import { mapGetters, mapMutations} from 'vuex'
import animations from 'create-keyframe-animation'
import { getSongUrl} from '_api/song'
import { prefixStyle } from '@/assets/js/dom'
const transform = prefixStyle('transform')
export default {
    data() {
        return {
            url: '',
            songReady: false
        }
    },
    computed: {
        playIcon() {
            return this.playing ? 'icon-pause': 'icon-play'
        },
        play() {
            return this.playing ? 'play': 'play pause'
        },
        disable() {
            return this.songReady?'':'disable'
        },
        ...mapGetters([
            'fullScreen',
            'playList',
            'currentSong',
            'playing',
            'currentIndex'
        ])
    },
    methods: {
        back() {
            this.SET_FULL_SCREEN(false)
        },
        open() {
            this.SET_FULL_SCREEN(true)
        },
        togglePlaying() {
            this.SET_PLAYING(!this.playing)
        },
        prev() {
            if(!this.songReady) return
            let index = this.currentIndex - 1
            if( index === -1) {
                index = this.playList.length - 1
            }
            this.SET_CURRENT_INDEX(index)
            if(!this.playing) {
                this.togglePlaying()
            }
            this.songReady = false
        },
        next() {
            if(!this.songReady) return
            let index = this.currentIndex + 1
            if( index === this.playList.length) {
                index = 0
            }
            this.SET_CURRENT_INDEX(index)
            if(!this.playing) {
                this.togglePlaying()
            }
            this.songReady = false
        },
        ended() {
            this.next()
        },
        ready() {
            this.songReady = true
        },
        error() {
            this.songReady = false
        },
        ...mapMutations([
            'SET_FULL_SCREEN',
            'SET_PLAYING',
            'SET_CURRENT_INDEX'
        ]),
        enter(el, done) {
            const{ x, y, scale} = this._getPosAndScale()
            let animation = {
                0: {
                    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
                },
                60: {
                    transform: `translate3d(0, 0, 0) scale(1.1)`
                },
                100: {
                    transform: `translate3d(0, 0, 0) scale(1)`
                }
            }
            animations.registerAnimation({
                name: 'move',
                animation,
                presets:{
                    duration: 400,
                    easing: 'linear'
                }
            })
            animations.runAnimation(this.$refs.cdWrapper, 'move', done)
        },
        afterEnter() {
            animations.unregisterAnimation('move')
            this.$refs.cdWrapper.style.animation= ''
        },
        leave(el, done) {
            this.$refs.cdWrapper.style.transition = ' all 0.4s'
            const{ x, y, scale} = this._getPosAndScale()
            this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
            this.$refs.cdWrapper.addEventListener('transitionend', done)
        },
        afterLeave() {
            this.$refs.cdWrapper.style.transition= ''
            this.$refs.cdWrapper.style[transform]= ''
        },
        _getPosAndScale() {
            const targetWidth = 40
            const paddingLeft = 40
            const paddingBottom = 30
            const paddingTop = 80
            const width = window.innerWidth * 0.8
            const scale = targetWidth / width
            const x = -(window.innerWidth / 2 - paddingLeft)    
            const y = window.innerHeight - paddingTop - width / 2 - paddingBottom         
            return {
                x,
                y,
                scale
            }
        }
    },
    watch: {
        currentSong(newVal) {
            getSongUrl(newVal.id).then((res) => {
                this.url = res
                this.$nextTick(() => {
                    this.$refs.audio.play()
                })
            })   
        },
        playing(newVal) {
            const audio = this.$refs.audio
            this.$nextTick(() => {
                newVal ? audio.play() : audio.pause()
            })
        },
        url(newVal) {
            this.songReady = true
        }
    }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/variable';
@import '@/assets/scss/mixin';
.player{
    .normal-player{
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 150;
        background: $color-background;
        .background{
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.6;
            filter: blur(20px)
        }
        .top{
            position: relative;
            margin-bottom: px2rem(25px);
            .back{
                position: absolute;
                top: 0;
                left: px2rem(6px);
                z-index: 50;
                .icon-return{
                    display: block;
                    padding: px2rem(9px);
                    font-size: $font-size-large-x;
                    color: $color-theme;
                    transform: rotate(-90deg);
                }
            }
            .title{
                width: 70%;
                margin: 0 auto;
                line-height: px2rem(40px);
                text-align: center;
                font-size: $font-size-large;
                color: $color-text;
            }
            .subtitle{
                line-height: px2rem(20px);
                text-align: center;
                font-size: $font-size-medium;
                color: $color-text;
            }
        }
        .middle{
            position: fixed;
            width: 100%;
            top: px2rem(80px);
            bottom: px2rem(170px);
            white-space: nowrap;
            font-size: 0;
            .middel-l{
                display: inline-block;
                vertical-align: top;
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 80%;
                .cd-wrapper{
                    position: absolute;
                    left: 10%;
                    top: 0;
                    width: 80%;
                    height: 100%;
                    .cd{
                        width: 100%;
                        height: 100%;
                        box-sizing: border-box;
                        border: px2rem(10px) solid rgba(255, 255, 255, 0.1);
                        border-radius: 50%;
                        &.play{
                            animation: rotate 20s linear infinite
                        }
                        &.pause{
                            animation-play-state: paused
                        }
                        .image{
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                        }
                    }
                }
                .playing-lyric-wrapper{
                    width: 80%;
                    margin:  px2rem(30px) auto 0;
                    overflow: hidden;
                    text-align: center;
                    .playing-lyric{
                        height: px2rem(20px);
                        font-size: $font-size-medium;
                        color: $color-text-l;
                    }
                }
            }
            .middle-r{
                display: inline-block;
                vertical-align: top;
                width: 100%;
                height: 100%;
                overflow: hidden;
                .lyric-wrapper{
                    width: 80%;
                    margin: 0 auto;
                    overflow: hidden;
                    text-align: center;
                    .text{
                        line-height: px2rem(32px);
                        color: $color-text-l;
                        font-size: $font-size-medium;
                        &.current{
                            color: $color-text
                        }
                    }
                }
            }
        }
        .bottom{
            position: absolute;
            bottom: px2rem(50px);
            width: 100%;
            .dot-wrapper{
                text-align: center;
                font-size: 0;
                .dot{
                    display: inline-block;
                    vertical-align: middle;
                    margin: 0 4px;
                    width: px2rem(8px);
                    height: px2rem(8px);
                    border-radius: 50%;
                    background: $color-text-l;
                    &.active{
                        width: px2rem(20px);
                        border-radius: px2rem(5px);
                        background: $color-text-ll;
                    }
                }
            }
            .progress-wrapper{
                display: flex;
                align-items: center;
                width: 80%;
                margin: 0 auto;
                padding:  px2rem(10px) 0;
                .time{
                    color: $color-text;
                    font-size: $font-size-small;
                    flex: 0 0 px2rem(30px);
                    line-height: px2rem(30px);
                    width: px2rem(30px);
                    &.time-l{
                        text-align: left;
                    }
                    &.time-r{
                        text-align: right;
                    }
                }
                .progress-bar-wrapper{
                    flex: 1;
                }
            }
            .operators{
                display: flex;
                align-items: center;
                .icon {
                    flex: 1;
                    color: $color-theme;
                    &.disable{
                        color: $color-theme-d
                    }
                    i{
                        font-size: px2rem(30px);
                        font-style: normal;
                    }
                }
                .i-left{
                    text-align: right
                }
                .i-center{
                    padding: 0 px2rem(30px);
                    text-align: center;
                    i{
                        font-size: px2rem(40px)
                    }
                }
                .i-right{
                    text-align: left;
                }
                .icon-love{
                    color: $color-sub-theme;
                }
            }
        }
        &.normal-enter-active, &.normal-leave-active{
                transition: all .4s;
                .top, .bottom{
                    transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
                }
            }
            &.normal-enter, &.normal-leave-to{
                opacity: 0;
                .top{
                    transform: translate3d(0, px2rem(-100px), 0);
                }
                .bottom{
                    transform: translate3d(0, px2rem(100px), 0)
                }
            }
    }
    .mini-player{
        display: flex;
        align-items: center;
        position: fixed;
        left: 0;
        bottom: 0;
        z-index: 180;
        width: 100%;
        height: px2rem(60px);
        background: $color-highlight-background;
        &.mini-enter-active, &.mini-leave-avtive{
            transition: all .3s;
        }
        &.mini-enter, &.mini-leave-to{
            opacity: 0;
        }
        .icon {
            flex:  0 0 px2rem(40px);
            width: px2rem(40px);
            padding: 0 px2rem(10px) 0 px2rem(20px);
            img{
                border-radius: 50%;
                &.play{
                    animation: rotate 10s linear infinite
                }
                &.pasue{
                    animation-play-state: paused;
                }
            }
        }
        .text{
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            line-height: px2rem(20px);
            overflow: hidden;
            .name{
                margin-bottom: 2px;
                font-size: $font-size-medium;
                color: $color-text;
            }
            .desc{
                font-size: $font-size-small;
                color: $color-text-d;
            }
        }
        .control{
            flex: 0 0 px2rem(30px);
            width: px2rem(30px);
            padding: 0 px2rem(10px);
            .icon-play, .icon-pause, .icon-list {
                font-size: px2rem(30px);
                color: $color-theme-d
            }
            .icon-mini{
                font-size: px2rem(32px);
                position: absolute;
                left: 0;
                top: 0
            }
        }
    }
    @keyframes rotate {
        0%{
            transform: rotate(0)
        }
        100%{
            transform: rotate(360deg)
        }
    }
}
</style>
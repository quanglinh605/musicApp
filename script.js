const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const player = $('.player')
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev'); 
const randomBtn = $('.btn-random'); 
const repeatBtn = $('.btn-repeat'); 
const playList = $('.playList');
const equalizer = $('#equalizer');
const lines = $$('.vertical');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Yêu em hơn mỗi ngày",
            singer: "Andiez",
            path: "./audio/yeuEmHonMoiNgay.mp3",
            image: "./images/yeu-em-hon-moi-ngay.webp"
        },
        {
            name: "Kiêu Ngạo",
            singer: "Huy Vạc",
            path: "./audio/KIÊU NGẠO - HUY VẠC (LYRIC VIDEO).mp3",
            image: "./images/kieuNgao.webp"
        },
        {
            name: "Ngày yêu mới",
            singer: "Không biết",
            path: "./audio/Ngày Yêu Mới - Nguyễn Hữu Kha.mp3",
            image: "./images/NgayYeuMoi.jpg"
        },
        {
            name: "Vẫn nhớ",
            singer: "Soobin Hoàng Sơn",
            path: "./audio/Vẫn Nhớ - Soobin Hoàng Sơn - Cover.mp3",
            image: "./images/VanNho.jpg"
        },
        {
            name: "Ôm em lần cuối",
            singer: "NT",
            path: "./audio/ÔM EM LẦN CUỐI - NIT ft. SING - OFFICIAL MUSIC VIDEO.mp3",
            image: "./images/OmEmLanCuoi.webp"
        },
        {
            name: "Tháng mấy em nhớ anh",
            singer: "Hà Anh Tuấn",
            path: "./audio/thangMayEmNhoAnh.mp3",
            image: "./images/thangMayEmNhoAnh.webp"
        },
        {
            name: "Anh sẽ quên em mà",
            singer: "NT",
            path: "./audio/ANH SẼ QUÊN EM MÀ (#ASQEM) - NIT FT. SING - AUDIO LYRICS.mp3",
            image: "./images/anhSeQuenEmMa.webp"
        },
        {
            name: "Đợi một lời chia tay",
            singer: "Trịnh Thiên Ân",
            path: "./audio/ĐỢI MỘT LỜI CHIA TAY - Trịnh Thiên Ân ft Lê Hữu Minh (Nhạc Ngoại lời Việt).mp3",
            image: "./images/doiMotLoiChiaTay.webp"
        },
        {
            name: "Nỗi đua còn vương",
            singer: "Anh Khoa",
            path: "./audio/NỖI ĐAU CÒN VƯƠNG - ANH KHOA - OFFICIAL MUSIC VIDEO.mp3",
            image: "./images/noiDauConVuong.webp"
        },
        {
            name: "Chỉ là muốn nói",
            singer: "Khải",
            path: "./audio/Chỉ Là Muốn Nói (300) - Khải.mp3",
            image: "./images/chiLaMuonNoi.webp"
        }
    ],
    setConfig: function(key, value) {
        console.log(key, value);
        this.config[key] = value; 
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    //render songs 
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
                <div data-index="${index}" class="song ${index===this.currentIndex ? 'active' : ''}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        })
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];   
            }
        });
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        // Xử lý cd quay / dừng 
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newWidth = cdWidth - scrollTop;
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            cd.style.opacity = newWidth / cdWidth;
        }
        // Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        // Khi song được player
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
            _this.setEqualizer();
        }
        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
            _this.unsetEqualizer();
        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent;
            }
        }
        // Xử lý khi tua nhạc
        progress.oninput = function(e) {
            const seekTime = Math.floor(audio.duration / 100 * e.target.value);
            audio.currentTime = seekTime;
            audio.pause();
            setTimeout(() => {
                audio.play();
            }, 400);
        }
        // Khi next bài hát
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong();
        }
        // Khi prev bài hát
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render()
        }
        // Xử lý random bài hát
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom); 
            randomBtn.classList.toggle("active", _this.isRandom);
        }
        // xử lý lặp lại một bài hát 
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat); 
            repeatBtn.classList.toggle("active", _this.isRepeat);
        }
        // Xử lý next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }
        // Xử lý khi click vào playList
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            // Điều kiện khi click vào song chưa active và click vào option bên phải song
            if (songNode || e.target.closest('.option')) {
                // Khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render()
                    audio.play();
                }
                // Khi click vào song option
                if(e.target.closest('.option')){

                }
            }
        }
    },
    
    setEqualizer: function() {
        for (let i = 0; i < lines.length; i += 1) {
            let line = lines[i];
            line.style.animation = `equalizer ${Math.random() * (3 - 0.3) + 0.3}s ease infinite`;
            line.style.animationDirection = 'alternate-reverse'
            line.style.opacity = 1;
        }
    },
    unsetEqualizer: function() {
        for (let i = 0; i < lines.length; i += 1) {
            let line = lines[i];
            line.style.animation = ``;
            line.style.animationDirection = 'alternate-reverse';
            line.style.opacity = 0;
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 200);
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
        audio.play()
        // Current song into view
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 300)
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong()
    },
    start: function() {
        this.unsetEqualizer()
        // Gán cấu hình từ config vào vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho obj
        this.defineProperties();
        // Lắng nghe / xử lý các sự kiện
        this.handleEvents();
        // Load bài hát đầu tiên khi UI được tải
        this.loadCurrentSong();
        // render playlist
        this.render();         
        // Hiển thị trạng thái ban đầu của btn repeat và ramdom
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
        console.log(this.currentIndex);
    }
}

app.start()




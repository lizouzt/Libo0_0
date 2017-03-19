function galleryHandler (gallery) {
    let wipeEL      = gallery, 
        tarEl       = wipeEL.querySelector('.idg_pics'),
        anchorEL    = wipeEL.querySelector('.idg_alist'),
        curCellNum  = 0,
        _isDuration = false;

    const DURATION  = 400;
    const DOMVW     = document.documentElement.clientWidth;
    const TRANTPL   = 'translateX(@{tranx}px)';
    const LENGTH    = tarEl.children.length - 1;
    const cardNum   = tarEl.children.length - 2;

    let total_width = DOMVW * (LENGTH + 1);
    tarEl.style.width = total_width + 'px';
    anchorEL.dataset['seq'] = 0;

    let render = function (tranx) {
        tarEl.style.webkitTransform = TRANTPL.replace(/\@\{tranx\}/ , tranx);
    },

    animateHandler = function(args){
        let x = args[0] > DOMVW ? DOMVW : args[0];
        let tranx = x + this.tarEl.dx;

        _isDuration ? this.tarEl.classList.remove('nduring') : this.tarEl.classList.add('nduring');
        render(tranx);
    },

    turnAnchor = function (flag) {
        var seq = anchorEL.dataset['seq'],
            newSeq = (flag ? parseInt(seq) + 1 : parseInt(seq) - 1 + cardNum) % cardNum;
        anchorEL.dataset['seq'] = newSeq;

        anchorEL.querySelector('.active').classList.remove('active');
        anchorEL.children[newSeq].classList.add('active');
    },

    loadPic = function () {
        let img = tarEl.children[curCellNum].querySelector('img');
        if (img.dataset['org']) {
            img.src = img.dataset['org'];
            delete img.dataset['org'];
        }
    };

    Wipe.init({
        mindis: 70,
        needTransition: true,
        needLoop: false,
        wapperEl: wipeEL,
        tarEl: tarEl,
        wipeTransition: function(){
            _isDuration = false;
            animateHandler.call(this, arguments);
        },
        rollback: function(){
            _isDuration = true;
            animateHandler.call(this, [0]);
        },
        wipeRight: function(obj){
            if (curCellNum > 0) {
                --curCellNum;
                this.tarEl.classList.remove('nduring');
                render(this.tarEl.dx + DOMVW);

                turnAnchor(false);
            }

            if (curCellNum == 0) {
                setTimeout(function () {
                    curCellNum = LENGTH - 1;
                    this.tarEl.dx = DOMVW * curCellNum * -1;
                    this.tarEl.classList.add('nduring');
                    render(this.tarEl.dx);
                    loadPic();
                }.bind(this), DURATION * 0.8);
            }

            loadPic();

            if (curCellNum >= 0) return DOMVW;
        },
        wipeLeft: function(obj){
            if (curCellNum < LENGTH) {
                ++curCellNum;
                this.tarEl.classList.remove('nduring');
                render(this.tarEl.dx - DOMVW);

                turnAnchor(true);
            }

            if (curCellNum == LENGTH) {
                setTimeout(function () {
                    curCellNum = 1;
                    this.tarEl.dx = -DOMVW;
                    this.tarEl.classList.add('nduring');
                    render(this.tarEl.dx);
                    loadPic();
                }.bind(this), DURATION * 0.8);
            }
            loadPic();

            if (curCellNum <= LENGTH) return -DOMVW;
        }
    });
    
    /*
    *   loop init
    * */
    curCellNum = 1;
    tarEl.dx = -DOMVW;
    tarEl.classList.add('nduring');
    anchorEL.children[0].classList.add('active');
    render(-DOMVW);
}

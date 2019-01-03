(function (Global) {
    let Attractions = {
        data: {
            Default: '',
            Select: '',
            HotLength: 5,
            item: [],
        },

        init: function() {
            let attr = this;

            if (attr.data.Default) {
                attr.data.Select = attr.data.Default;
            }

            attr.getJsonData().then(function(resolve){
                attr.data.item = resolve.result.records;
                attr.setData().setSelect().sethotSelect();
            }).catch(function(reject) {
                attr.data.item = [];
                attr.setData().setSelect().sethotSelect();
                console.log(reject);
            });
        },

        getJsonData: function(){
            return new Promise(function(resolve, reject){
                let xhr = new XMLHttpRequest();
                xhr.open('get',
                    'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97',
                    true);
                xhr.addEventListener('load', function () {
                    resolve(JSON.parse(xhr.response));
                });
                xhr.addEventListener('error', function () {
                    reject(xhr.response);
                });
                xhr.send();                
            });
        },

        upDate: function() {
            this.setData().setSelect();
        },

        filterData: function(array, fn) {
            if(!array){ return array }

            let newArr = [];
            for(let i = 0; i < array.length; i++) {
                let bool = fn(array[i], i);
                if(bool) {
                    newArr.push(array[i])
                }
            }
            return newArr;
        },

        //只提取地區的部分
        getZoneArray: function() {
            return [... new Set(function(data){
                let newData = [];
                for (let i in data) {
                    newData.push(data[i].Zone);
                }
                return newData;
            }(this.data.item))]
        },

        setData: function(){
            let attr = this;
            let cardTemplateHtml = document.querySelector('#cardTemplate').content;
            let cardList = document.querySelector('#Card_List');
            let listTitle = document.querySelector('#List_Titile');
            let data = attr.filterData(attr.data.item, function(item, index){
                return attr.data.Select ? item.Zone === attr.data.Select : true;
            });
            cardList.innerHTML = '';
            listTitle.innerText = attr.data.Select ? attr.data.Select : '所有行政區域';
            for (let i = 0; i < data.length; i++) {
                // card List
                let card = cardTemplateHtml;
                card.querySelector('.cardBg').style.backgroundImage  = `url('${data[i].Picture1}')`;
                card.querySelector('.cardtitle').innerText = data[i].Name;
                card.querySelector('.cardsubtitle').innerText = data[i].Zone;
                card.querySelector('.businesshour').innerText = data[i].Opentime;
                card.querySelector('.address').innerText = data[i].Add;
                card.querySelector('.phone').innerText = data[i].Tel;

                cardList.appendChild(card.cloneNode(true));
            }
            return this;
        },
        setSelect: function() {
            let attr = this;
            let CitySelect = document.querySelector('#CitySelect');
            let data = this.getZoneArray();

            for (let i = 0; i < data.length; i++) {
                // select List
                let option = document.createElement('option');
                option.value = data[i];
                option.innerText = data[i];
                CitySelect.appendChild(option);
            }

            if (data.indexOf(attr.data.Select) == -1) {
                attr.data.Select = '';
                CitySelect.value = '';
            } else {
                CitySelect.value = attr.data.Select;
            }

            CitySelect.addEventListener('change', function() {
                attr.data.Select = CitySelect.value;
                attr.upDate();
            })
            return this;
        },
        
        sethotSelect: function() {
            let attr = this;
            let zone = this.getZoneArray();
            let hotCity = document.querySelector('#Hot_City');
            let hotCityTem = document.querySelector('#Hot_City_template').content;

            let randomArr = (function(){
                let arr = [];
                for(i = 0; i < attr.data.HotLength; i++) {
                    arr.push(Math.floor(Math.random()*zone.length))
                }
                return arr;
            }());

            //let randomArr = zone.length;
            for(let i = 0; i < randomArr.length; i++) {
                temp = hotCityTem.cloneNode(true);
                temp.querySelector('.btn').innerText = zone[randomArr[i]];
                temp.querySelector('.btn').classList.add('btnColor' + (i%4+1));
                temp.querySelector('.btn').setAttribute('data-value', zone[randomArr[i]]);
                temp.querySelector('.btn').addEventListener('click', function(e){
                    e.preventDefault();
                    attr.data.Select = this.dataset.value;
                    attr.upDate();
                });
                hotCity.appendChild(temp);
            }
            return this;
        }
    };

    // Global.addEventListener('load', Attractions.init.bind(Attractions));
    Global.addEventListener('load', function(){
        Attractions.init();
    });
}(window))
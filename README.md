### 公共组件仓库

##### 命名规范
* 类名: 三级结构[仓库－功能－模块]，按音节取首字母，如：lib->nav->dashboard简写为：l-n-db；以后逐级结构崩塌如:lndb-user,lndbu-name

##### 结构
* c
    * utils: 
        1. 功能型lib，如登陆、api、环境变量
        2. 全部已cmd结构编写，并注册到window.lib下，
            - 如：lib.api、lib.login
    * widget: 
        1. 基础型组件，如导航栏、账号面板、登陆入口
        2. 各组件单独建立文件夹，如
            - 如：
                - widget
                    - userDashBoard
                        - mod
                            - *.jst.html
                        - main.js
                        - main.css
* p[组件测试页面]
    * pages


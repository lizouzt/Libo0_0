# 通过官方推荐的方式签名打包APK

## Android
### 第一步：生成Android签名证书  
```
keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -validity 20000 -keystore ./android_demo.keystore
```

### 第二步：设置gradle变量   
1. 将你的签名证书copy到 android/app目录下。
2. 编辑`~/.gradle/gradle.properties`或`../android/gradle.properties`(一个是全局`gradle.properties`，一个是项目中的`gradle.properties`，大家可以根据需要进行修改) ，加入如下代码：     

```
MYAPP_RELEASE_STORE_FILE=your keystore filename  
MYAPP_RELEASE_KEY_ALIAS=your keystore alias  
MYAPP_RELEASE_STORE_PASSWORD=*****    
MYAPP_RELEASE_KEY_PASSWORD=*****  
```  
提示：用正确的证书密码、alias以及key密码替换掉 *****。

### 第三步：在gradle配置文件中添加签名配置   
编辑 android/app/build.gradle文件添加如下代码：  

```   
...  
android {  
    ...  
    defaultConfig { ... }  
    signingConfigs {  
        release {  
            storeFile file(MYAPP_RELEASE_STORE_FILE)  
            storePassword MYAPP_RELEASE_STORE_PASSWORD  
            keyAlias MYAPP_RELEASE_KEY_ALIAS  
            keyPassword MYAPP_RELEASE_KEY_PASSWORD  
        }  
    }  
    buildTypes {  
        release {  
            ...  
            signingConfig signingConfigs.release  
        }  
    }  
}  
...  
```

### 第四步：签名打包APK  
terminal进入项目下的android目录，运行如下代码：   
`./gradlew assembleRelease`   

![签名打包成功.png](https://raw.githubusercontent.com/crazycodeboy/RNStudyNotes/master/React%20Native%E5%8F%91%E5%B8%83APP%E4%B9%8B%E7%AD%BE%E5%90%8D%E6%89%93%E5%8C%85APK/images/%E7%AD%BE%E5%90%8D%E6%89%93%E5%8C%85%E6%88%90%E5%8A%9F.png)

签名打包成功后你会在 "android/app/build/outputs/apk/"目录下看到签名成功后的app-release.apk文件。  
提示：如果你需要对apk进行混淆打包 编辑android/app/build.gradle：   

```  
/**     
 * Run Proguard to shrink the Java bytecode in release builds.  
 */  
def enableProguardInReleaseBuilds = true  
```

## 如何在gradle中不使用明文密码？  
上文中直接将证书密码以明文的形式写在了gradle.properties文件中，虽然可以将此文件排除在版本控制之外，但也无法保证密码的安全，下面将向大家分享一种方法避免在gradle中直接使用明文密码。   

### 通过“钥匙串访问(Keychain Access)”工具保护密码安全  
下面阐述的方法只在OS X上可行。  
我们可以通过将发布证书密码委托在“钥匙串访问(Keychain Access)”工具中,然后通过gradle访问“钥匙串访问”工具来获取证书密码。  

### 具体步骤：  
1. `cmd+space`打开“钥匙串访问(Keychain Access)”工具。
2. 在登录选项中新钥匙串，如图：  
![通过“钥匙串访问(Keychain Access)”工具保护密码安全  .png](https://raw.githubusercontent.com/crazycodeboy/RNStudyNotes/master/React%20Native%E5%8F%91%E5%B8%83APP%E4%B9%8B%E7%AD%BE%E5%90%8D%E6%89%93%E5%8C%85APK/images/%E9%80%9A%E8%BF%87%E2%80%9C%E9%92%A5%E5%8C%99%E4%B8%B2%E8%AE%BF%E9%97%AE(Keychain%20Access)%E2%80%9D%E5%B7%A5%E5%85%B7%E4%BF%9D%E6%8A%A4%E5%AF%86%E7%A0%81%E5%AE%89%E5%85%A8%20%20.png)

提示： 你可以在terminal中运行如下命令检查新建的钥匙串是否成功。   
 `security find-generic-password -s android_keystore -w`  
3. 在build.gradle中访问你的秘钥串,将下列代码编辑到android/app/build.gradle中：   

```
def getPassword(String currentUser, String keyChain) {
   def stdout = new ByteArrayOutputStream()
   def stderr = new ByteArrayOutputStream()
   exec {
       commandLine 'security', '-q', 'find-generic-password', '-a', currentUser, '-s', keyChain, '-w'
       standardOutput = stdout
       errorOutput = stderr
       ignoreExitValue true
   }
   //noinspection GroovyAssignabilityCheck
      stdout.toString().trim()
}
```    

```
// Add this line
def pass = getPassword("YOUR_USER_NAME","android_keystore")
...
android {
    ...
    defaultConfig { ... }
    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword pass // Change this
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword pass // Change this
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
...
```   

**注意事项**   
钥匙串访问(Keychain Access)工具只是帮我们托管了，证书密码，证书明和alias还是需要我们在`gradle.properties`中设置一下的。

React Graceful Image
=============================

An image component for gracefully dealing with image errors, by providing a placeholder and retries on failure. Particularly useful in situations where your application might be used in poor signal areas such as when travelling on a train, bus or in a car.

### Example

<table>
<tr>
<th>1</th>
<th>2</th>
<th> 3</th>
<th> 4</th>
</tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/16339741/35174790-8ebe4bcc-fd68-11e7-935b-f15407ef2d94.png" alt="browser broken image" width="200" height="129.411764706"></td>
    <td><img src="https://user-images.githubusercontent.com/16339741/35175624-6aad9568-fd6c-11e7-9aa0-329a5d2b1728.png" alt="browser with placeholder image" width="200" height="129.411764706"></td>
    <td><img src="https://user-images.githubusercontent.com/16339741/35175639-83d1a656-fd6c-11e7-9812-480c251acf98.png" alt="browser without placeholder image" width="200" height="129.411764706"></td>
    <td><img src="https://user-images.githubusercontent.com/16339741/35177052-c962542e-fd74-11e7-8b46-325f444c7970.png" alt="browser with working image after retry" width="200" height="129.411764706"></td>
  </tr>
</table>

1. Default browser behaviour when image fails due to bad signal
2. With react-graceful-image placeholder
3. With react-graceful-image disabled placeholder
4. With react-graceful-image retries - if the image fails to load, the package will gracefully re-attempt loading the image again

_(**_note:_** these are not mutually exclusive, for example the default behaviour makes use of both 2 & 4 together.)_

### Installation

```sh
npm install --save react-graceful-image
```

### Basic Usage

```js
import React, { Component } from 'react'
import Image from 'react-graceful-image'

class YourComponent extends Component {
  render() {
    return <Image src="path_to_image" width="300" height="300" alt="My awesome image" />
  }
}
```

### Default Behaviour

While the image loads
1. Render an SVG placeholder - if environment doesn't support SVG, then avoid rendering the placeholder
2. If image loads successfully then display the image
3. If image fails to load - retry loading the image starting with a 2 second delay and doubling it with every retry *(by default retry stops after 8 tries)*

### Prop Options

| Prop | Description | Default | Type |
|---|---|---|---|
|**`src`**|Image url / path |*None*|*string*|
|**`width`**|Image width |*None*|*string*|
|**`height`**|Image height |*None*|*string*|
|**`className`**|Image class name |*None*|*string*|
|**`alt`**|Image description |*`"Broken image placeholder"`*|*string*|
|**`style`**|Image styles |*None*|*object*|
|**`placeholderColor`**|Placeholder's color|*`"#eee"`*|*string*|
|**`noPlaceholder `**|Turn off placeholder rendering|*false*|*bool*|
|**`retry`**|Retry algorithm's configuration, consisting of `count`, `delay` and `accumulate`|*`{count: 8, delay: 2, accumulate: 'multiply'}`*|*object*|
|**`noRetry`**|Turn off re-trying|*false*|*bool*|

### Retry

You can modify the default retry algorithm by supplying a `retry` prop consisting of 3 properties: `count`, `delay` and `accumulate`:

- `count` specifies the number of times you want to retry
- `delay` specifies the delay between retries (in seconds)
- `accumulate` specifies how the delay should increase with each retry, **_possible values:_** `"multiply"` (default), `"add"` or `false` (false can also be represented by simply omitting this property)

#### Accumulate

- `accumulate: "multiply"` will multiply delay after each retry by the given `delay` value, i.e. if `delay: 2` is given then 1st retry will be in 2 seconds, 2nd retry will be in 4 seconds, 3rd retry will be in 8 seconds, 4th retry will be in 16 seconds etc.
- `accumulate: "add"` will increment delay after each retry by the given `delay` value, i.e. if `delay: 2` is given then 1st retry will be in 2 seconds, 2nd retry will be in 4 seconds, 3rd retry will be in 6 seconds, 4th retry will be in 8 seconds, etc.
- `accumulate: "false"` will keep the delay constant between retries, i.e. if `delay: 2` is given then retry will run every 2 seconds

### Examples

**1**: Below code snippet will load the given image, while the image loads it will display a light grey (default) SVG placeholder. If loading the image fails, then it will retry loading the image again for a maximum of 10 times, with a fixed 2 second delay between each try.

```js
import React, { Component } from 'react'
import Image from 'react-graceful-image'

class YourComponent extends Component {
  render() {
    return (
        <Image
            src="path_to_image"
            width="250"
            height="250"
            style={{padding: '20px'}}
            alt="My awesome image"
            retry={{count: 10, delay: 2}}
       />
    );
  }
}
```

**2**: Below code snippet will load the given image, while the image loads it will display a blue SVG placeholder. If loading the image fails, then it will retry loading the image again for a maximum of 8 times, with initial delay of 2 seconds, which will then increase to 4 seconds, then to 8 seconds, then to 16 seconds, and so on (default retry configuration).

```js
import React, { Component } from 'react'
import Image from 'react-graceful-image'

class YourComponent extends Component {
  render() {
    return (
        <Image
            src="path_to_image"
            className="content-image"
            alt="My awesome image"
            placeholderColor="#0083FE"
       />
    );
  }
}
```

**3**: Below code snippet will load the given image, while the image loads it will display a light grey (default) SVG placeholder. If loading the image fails, then it will retry loading the image again for a maximum of 15 times, with initial delay of 3 seconds which will then increase to 6 seconds, then to 9 seconds, then to 12 seconds, and so on.

```js
import React, { Component } from 'react'
import Image from 'react-graceful-image'

class YourComponent extends Component {
  render() {
    return (
        <Image
            src="path_to_image"
            width="150"
            height="150"
            style={{padding: '20px'}}
            alt="My awesome image"
            retry={{count: 15, delay: 3, accumulate: 'add'}}
       />
    );
  }
}
```

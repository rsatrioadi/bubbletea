# Layered BubbleTea Software Architecture Visualisation

## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

To create a production version:

```bash
npm run build
```
## Input format

A CSV file that looks like this:

|package|class|layer|count|
|--|--|--|--|
|com.fsck.k9|com.fsck.k9.FontSizes|Presentation Layer|0.13513513513513514|
|com.fsck.k9|com.fsck.k9.FontSizes|Domain Layer|0.8108108108108109|
|com.fsck.k9|com.fsck.k9.FontSizes|Data Source Layer|0.05405405405405406|
|com.fsck.k9|com.fsck.k9.NotificationSetting|Domain Layer|0.8125|
|...||||

Explanation: In the class `com.fsck.k9.FontSizes` in the example above, 13.5% of its methods exhibit *presentation layer* indications, 81.1% exhibits *domain layer* indications, and 5.4% methods with *data source layer* indications.

For examples complete files that can be loaded into the visualisation, see: [data/bubbletea-viz](https://github.com/rsatrioadi/phd/tree/main/data/bubbletea-viz)

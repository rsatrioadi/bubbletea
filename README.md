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
|com.fsck.k9|com.fsck.k9.Throttle$MyTimerTask|Service Layer|0.5|
|com.fsck.k9|com.fsck.k9.Throttle$MyTimerTask|Presentation Layer|0.5|
|com.fsck.k9|com.fsck.k9.Throttle|Unknown Layer|0.5|
|com.fsck.k9|com.fsck.k9.Throttle|Service Layer|0.5|
|com.fsck.k9|com.fsck.k9.PRNGFixes|Unknown Layer|1.0|
|...||||

Explanation: In the class `com.fsck.k9.Throttle$MyTimerTask` in the example above, 50% of its methods exhibit *service layer* indications, while the other 50% exhibits *presentation layer* indications.

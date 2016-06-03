# Data Normalization

Our data is structured as a hierarchy of *projects* containing *tasks*.  This kind of structure has become more frequent with the popularity of No-SQL databases.  Deep hierarchical collections of data are found all too frequently.  The data stored in such databases is often not normalized.  Data normalization is an important concept in data management, we can even learn from [Wikipedia](https://en.wikipedia.org/wiki/Database_normalization).

The problem with databases which are not normalized can be seen, for example, in our projects reducer [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/projects/reducer.js#L16-L32).  It's complexity is, to a certain point, the consequence of it being too deep.  Instead of having just one collection of data as we had up to now [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/projects/data.js) with a collection of projects each containing a collection of tasks, we may have two separate tables, one for projects and another for tasks [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/data.js).  

## Data

Our new `data.js` contains a collection of `projects` whose first entry is this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/data.js#L1-L7)

Here, project `25` does not contain any task data.  What it has instead is an array of `tids`, references to task-ids.  Then we have the collection of `tasks` such as these first two entries:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/data.js#L14-L22)

This allows us to access one set of data independently of the other.  When we have to deal with tasks, we just go for them, we don't need to reach them via the project they belong to, we don't need to traverse a deep hierarchy.  Obviously here the depth was just two, but in the real world, this kind of hierarchical data can go many layers deep, making matters really tough.

There is another advantage to normalization.  Lets imagine we cannot write a book while hungry.  Thus, if we mean to have a Spanish tortilla for lunch, its tasks become a pre-requisite for writing a book.  In our nested hierarchy, task 4: `Peel and dice the potatoes` could not become a task for project 25: `Write a Book on Web Dev Tools` unless it is repeated in each branch. Updating it then becomes troublesome because when we get the potatoes peeled, we would need to search for occurrences in all of the branches to check it as completed.  

With a normalized database, since projects only keep references to tasks via their `tid`s, we may add the `tid` of any task to any number of projects. Peeling potatoes can be a task in both projets at the same time.

## Reducers

A Redux store is mostly defined by its reducers so, once our `data.js` file is fixed [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/data.js) we have to fix our old reducer [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/projects/reducer.js) splitting it in two, `tasksReducer` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/tasksReducer.js) and `projectsReducer` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/projectsReducer.js).

Unlike the previous single reducer, this one is initialized with just part of the data in `data.js`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/tasksReducer.js#L4-L8)

The `state` argument is set to default to `data.tasks` instead of the whole `data` file.  The reducer still has the same structure as all reducers, with a switch statement branching off depending on `action.type`.  For the `TASK_COMPLETED_CHANGE`, our `update` call is much simpler:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/tasksReducer.js#L9-L16)

Now it doesn't need to use the `action.pid` property since it can access the task directly by its `tid`.

The change in the completion status of a task also affects the pending count for the project so the `projectsReducer` also has to deal with that:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/projectsReducer.js#L15-L32)

As with the `tasksReducer`, the `projectsReducer` is initialized out of one branch of the data: `data.projects`.

This shows us an important feature of Redux.  An action is broadcast to all reducers and each might decide to handle it or not.  If we didn't keep a `pending` count, the `switch` statement in `projectsReducer` would only have the `default:` label with no *cases:*.

The `projects` folder now has two reducers, thus we cannot just export it as the *default* as we did before [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/projects/index.js#L3-L4), instead, we make two separate named exports:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/index.js)

We export the `default` from `projectsReducer` as `projects` and the `default` from `tasksReducer` as `tasks`.

We then import those two named exports from `./projects` and combine it into our single Redux store:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/createStore.js#L4-L10)

We might have done it in different ways.  We might have combined them earlier in `store/projects/index.js`  [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/projects/index.js) by doing:

```js
import { combineReducers } from 'redux';

import projects from './projectsReducer';
import tasks  from './tasksReducer';

export default combineReducers({
  projects,
  tasks,
});
```

And then combining that with the rest of the reducers for the other (future) sub-stores in `store/createStore.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/client/store/createStore.js).   The problem with this alternative is that each use of `combineReducers` adds one level to the store.  Thus, with the first alternative a project name could be read from the store as `state.projects[pid].name` while by this alternative, it would have been `state.projects.projects[pid].name`, an extra `projects` level added by the second `combineReducers`.

We might have also take the `tasks` part out of the `store/projects` folder and create a separate `store/tasks` folder.

The point is Redux gives us quite some freedom in the ways to structure our store and sub-stores by combining the reducers in several ways.  

## Components

The `Task` component has much easier access to its data, instead of having:

```js
export const mapStateToProps = (state, props) => state.projects[props.pid].tasks[props.tid];
```

It becomes:  

```js
+export const mapStateToProps = (state, props) => state.tasks[props.tid];
```

And in `TaskList`, instead of looping through the keys in the `tasks` object:

```js
Object.keys(tasks).map(tid => (
```

We loop through the array of `tids` that each project contains:

```js
tids.map(tid => (

```

Incidentally, we get an extra advantage.  An array always preserves the order of the elements in it, an object doesn't.  So, having the `tid`s in an array means that we can make certain that we don't *fry the potatoes* before having them *peeled and diced*.

## Server side

Though we haven't been using it in the last few chapters, our server still responds to the REST API requests as it did before.  Since we used an SQL database, the tables themselves are already normalized since that is standard practice with SQL.  We still have to change the API because our API returns a deep hierarchy of tasks within projects instead of just returning the `tid`s of the tasks in that project.  

One design consideration in SQL databases is the *cardinality* of the relation in between the tables, that is, how many elements may be on each side.  We currently have a *one-to-many* relation, that is, one project may have many tasks.  There is also a *one-to-one* relation which is trivial and, if found, it means the two related pieces of data can actually be merged into a single table.

If the same task can appear in more than one project, then we would have a *many-to-many* relation.  One project can have many tasks and a task can show up in many projects.

A simple rule of thumb says that for a *one-to-one* relation, we don't actually need two tables, one is enough.  For a *one-to-many* relation, we need two tables, which is exactly what we have.  For a *many-to-many* relation, we need three tables, one for the projects, one for the tasks and a third one matching `pid`s with `tid`s.

Of course, there could be other combinations.  A project might contain other projects as sub-projects, not just share its tasks.  That would require extra information to signal whether the reference is a `tid` pointing to another task or a `pid` pointing to a sub-project.

For the purpose of this book, we will stick with the *one-to-many* relation and keep our two tables.  We must change one of the APIs, the one for the `/:pid` route [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/server/projects/routes.js#L23-L25) which uses `getProjectById` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-01/server/projects/transactions.js#L49-L65).  Currently, it returns the project requested along with its tasks, in a hierachy very much like we had in our earlier `data.js`.  Now, we must change it so that it returns the project properties plus an array of `tid`s.

Since we are changing the API interface, we change the version number from `v1` to `v2`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-02/server/index.js#L16)

In a real-life situation, if the application had been already made public, we would have the management issue of keeping both versions 1 and 2 active at once so we would have to add a route for `v2` instead of replacing that for `v1`.   That is a management issue we will ignore at the moment.

The major change is the `getProjectById` which instead of returning a `tasks` object returns a `tids` array:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-02/server/projects/transactions.js#L49-L59)

We also change the `selectTasksByPid` prepared SQL statement which instead of returning the `tid`, `descr` and `completed` fields, just needs to return the `tid`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-02/server/projects/transactions.js#L11-L13)

Finally, we also change the tests.  Besides changing the URL to point to the `v2` API [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-02/test/server.js#L56-L60), we change the test for the result of a `GET` on `/25`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-02/test/server.js#L164-L167)

Besides checking the `name` and `descr` values, we now check that the `tids` field is an array and that it contains the `tid`s of its tasks, instead of the whole description and completion status for each.

### Reducing the number of requests

We have a problem with this mechanism. Any request for a project would only get the references to the tasks in that project, just the `tid`s.  It would require many follow up requests to get the task data itself. This would generate unnecessary traffic and significantly slow down the application as the user would see the list of tasks growing slowly.

With a limited number of tasks per project, as is our case, it makes more sense to return the tasks all at once, as we were doing so far.

If the number of tasks (or any other subordinated set of data) is very large it might be better to send the tasks separately and reduce the number of requests by batching the requests into separate sets.   Once the response for the project arrives, we might break the array of `tid`s into chunks of 10, 50 or some reasonable number of tasks on each batch and request each set separately.  As the responses for each of the sets arrive, we may refresh the screen so the user sees the data as it comes.

React along Redux makes this a very easy mechanism to implement. Each arrival of data would trigger an action which would update the store with the newly arrived data (via the corresponding reducer).  The store would notify all subscribers of the change and the components would update the screen to include the updated data.

Finally, if we had a *many-to-many* relation in between projects and tasks, we would need to keep the requests separate since, before requesting a particular task, we would have to check whether that task has already been loaded due to some other project that also contains it.  The missing ones might be batched, as described above.

As it stands right now, we are in the first situation, a *one-to-not-so-many* relation so our `v1` REST API would be better for us.  We will do only one minor change.

We will return the `tasks` but as an array, not an indexed object [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-03/server/projects/transactions.js#L49-L63). We will deal with indexes later on.  We also changed the tests to reflect this [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-03/test/server.js#L166-L181).

## Summary

We have taken the data for the tasks as a separate collection within our `data.js` file.  This is called database normalization and is common practice.  Our application has been simplified as a result.  Though it might not be immediately obvious right now, this simplification will make our lives easier as the application grows.

We have seen how a reducer can be split and later combined in a couple of ways.

We have also applied the same normalization principles to our REST API.  We have discussed a few alternatives on how to respond to requests for hierarchical data.  For our particular set of data, with a *one-to-many* relation and not so many on the *many* side, we decided to send all the tasks along the project they belong two.  We simply changed the format of the returned data.

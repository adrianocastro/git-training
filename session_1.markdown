# The Git sessions
## Session 1: The Basics

### What's Git?
- version control system
- open source
- <q>created by the same dudes that created Linux</q> [^github-intro]
- <q>At the heart of GitHub</q> [^github-intro] <small>(this will make sense later)</small>

[^github-intro]: http://help.github.com/mac-set-up-git/

### How is it different from SVN?
- **SVN** is a **centralised** version control system
    - everyone contributes to a single repository
- **Git** is a **distributed** version control system
    - each clone is a full mirror of the repository

Read more about the [different types of version control systems](http://progit.org/book/ch1-1.html).

### Distributed? Wait. What?!

- each clone is a full mirror of the repository
- works offline
    - works even when the repository you push to is down
- works very well with several remote repositories
- fast because most operations are run locally
- branching is easy an encouraged
- merging is much easier
- allows for better collaboration across team mates and even other teams

### Distributed? Wait. What?! (ctd.)
#### Centralized
![Centralized version control diagram](http://progit.org/figures/ch1/18333fig0102-tn.png)

#### Distributed
![Distributed version control diagram](http://progit.org/figures/ch1/18333fig0103-tn.png)

### How does all of this translate into every day coding?

- commit early, commit often, commit without fear
    - key changes are versioned and safe
- branch for features
- branch for experiments
- branch for testing
- collaborate with others
    - no more sharing code on pastebin, email or ping

### Git !== GitHub

- <q>**Git** is an extremely fast, efficient, distributed version control system ideal for the collaborative development of software</q> [^git_vs_github]
- <q>**GitHub** is the best way to collaborate with others. Fork, send pull requests and manage all your public and private Git repositories.</q> [^git_vs_github]
    - think of it as SVN viewer, bugzilla and codereview.corp combined

[^git_vs_github]: https://github.com/

### Installation and configuration (name, email)
#### Getting Git

- at Y!: `$ yinst i git_core_y`
- elsewhere: [http://git-scm.com/](http://git-scm.com/)

Try it:

    $ git

#### Configuration

    $ git config --global user.name `whoami`
    $ git config --global user.email `whoami`@yahoo-inc.com

    # Make it look pretty
    $ git config color.ui true

Note: in normal situations `user.name` would be your actual name but at Y! it has to be your Y!ID.

### Creating your first Git repository

    $ mkdir git-training
    $ cd git-training

    # this will initialise the git-training directory
    # as a git repository

    $ git init

Git will reply: `Initialized empty Git repository in .git/`

### What’s in the .git directory

- `.git/` is where Git stores the metadata and object database for the repository
- _**DON’T** touch it!_

### Adding files

    $ git status
    # Nothing to commit

    $ touch README

    $ git status
    # Untracked files

    $ git add README
    # Changes to be committed:
    #   (use "git rm --cached <file>..." to unstage)

### The four states

- **committed**
    - file is safely stored in the repository’s database
- **modified**
    - file has changed but hasn’t been committed yet
- **staged**
    - modified file has been marked in its current version as ready to be committed
- **untracked**
    - file isn’t under version control

### The three sections

- **git directory**
    - where **committed** files live
- **working directory**
    - where **modified** and **untracked** files live
- **staging** (aka index)
    - where **staged** files live

![Working directory, staging area, and git directory](http://progit.org/figures/ch1/18333fig0106-tn.png)

### Committing files

    $ git commit

    # Or with an inline commit message
    $ git commit -m 'Added README.'

    [master (root-commit) 454a516] Added README.
     0 files changed, 0 insertions(+), 0 deletions(-)
     create mode 100644 README

Where:

- `master` is the branch the file was committed to
- `454a516` is the SHA-1 hash checksum which uniquely identifies the commit
- `0 files changed, 0 insertions(+), 0 deletions(-)` because the file was empty and git is looking at the file’s contents
- `mode 100644 README` because the file was added with `644` permissions, i.e. world readable but only writeable by the owner (`rw-r--r--`)

### Making changes

    $ echo 'This is my Git training repository.' > README
    $ git status
    # On branch master
    # Changed but not updated
    …

### Staging, diffing and committing files
### Viewing and understanding the logs
### Tips and tricks (prompt, aliasing, colours)


| SVN            | git           |
| :------------: | :-----------: |
| centralised          | distributed    |

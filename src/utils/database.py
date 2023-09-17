import logging
from contextlib import asynccontextmanager

import aiomysql
from pymysql.constants import CLIENT
from pymysql.err import MySQLError

LOGGER = logging.getLogger(__name__)


class DatabaseConnection:
    def __init__(self, **kwargs) -> None:
        self.config = kwargs
        self._pool: aiomysql.Pool = None

    async def _create_pool(self):
        if self._pool is not None:
            return True
        try:
            self._pool: aiomysql.Pool = await aiomysql.create_pool(pool_recycle=5, **self.config, client_flag=CLIENT.MULTI_STATEMENTS)
            async with self._pool.acquire() as conn:
                LOGGER.info(
                    "Pool Created on Database: %s@%s:%s",
                    conn.user,
                    conn.host,
                    conn.port,
                )
        except Exception as ex:
            LOGGER.error("Could not create connection pool: %s", ex)
            return False
        else:
            return True

    @asynccontextmanager
    async def _acquire(self):
        await self._create_pool()
        async with self._pool.acquire() as conn:
            await conn.autocommit(True)
            async with conn.cursor() as cur:
                yield cur

    async def _execute_query(self, *args):
        async with self._acquire() as cur:
            await cur.execute(*args)
            return cur

    async def execute_sql(self, query, *args) -> aiomysql.Cursor:
        try:
            return await self._execute_query(query, *args)
        except MySQLError as ex:
            LOGGER.error("Failed to execute SQL: %s", ex)
            return await self._execute_query(query, *args)

    async def _execute_many_query(self, *args):
        async with self._acquire() as cur:
            await cur.executemany(*args)
            return cur

    async def execute_many_sql(self, query, *args) -> aiomysql.Cursor:
        try:
            return await self._execute_many_query(query, *args)
        except MySQLError as ex:
            LOGGER.error("Failed to execute SQL: %s", ex)
            return await self._execute_many_query(query, *args)
